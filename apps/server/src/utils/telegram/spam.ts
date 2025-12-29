import type { MiddlewareFn } from 'grammy';
import type { BotContext } from './types';

// Define spam thresholds
const SPAM_WINDOW = 60 * 1000; // 1 minute window
const MAX_MESSAGES_PER_WINDOW = 30; // Max 10 messages per minute
const MUTE_DURATIONS = [
  60 * 1000, // 1 minute
  5 * 60 * 1000, // 5 minutes
  10 * 60 * 1000, // 10 minutes
  60 * 60 * 1000, // 1 hour
  24 * 60 * 60 * 1000, // 24 hours
];

/**
 * Middleware to protect against spam messages
 * Implements progressive penalties for users who send too many messages
 */
export const spamProtectionMiddleware: MiddlewareFn<BotContext> = async (
  ctx,
  next
) => {
  // Skip for non-message updates or for admin commands
  if (!ctx.message || ctx.message.text?.startsWith('/admin')) {
    return next();
  }

  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;

  if (!userId || !chatId) {
    return next();
  }

  // Initialize spam protection for this user if not exists
  if (!ctx.session.spamProtection) {
    ctx.session.spamProtection = {
      messageCount: 0,
      lastMessageTime: Date.now(),
      warningLevel: 0,
    };
  }

  const protection = ctx.session.spamProtection;
  const now = Date.now();

  // Reset counter if outside the window
  if (now - protection.lastMessageTime > SPAM_WINDOW) {
    protection.messageCount = 1;
    protection.lastMessageTime = now;
  } else {
    protection.messageCount++;
  }

  // Check if user is currently muted
  if (protection.mutedUntil && now < protection.mutedUntil) {
    // User is muted, don't process their message
    const remainingTime = Math.ceil((protection.mutedUntil - now) / 60000); // in minutes
    try {
      // Delete their message if in a group
      if (ctx.chat.type !== 'private') {
        await ctx.deleteMessage();
      }

      // Only remind them once per minute about being muted
      if (now - protection.lastMessageTime > 60000) {
        await ctx.reply(`You are muted for ${remainingTime} more minute(s).`);
      }
    } catch (error) {
      console.error('Error handling muted user message:', error);
    }

    protection.lastMessageTime = now;
    return; // Don't process further
  }

  // Check if user is spamming
  if (protection.messageCount > MAX_MESSAGES_PER_WINDOW) {
    // Increase warning level
    protection.warningLevel = Math.min(
      protection.warningLevel + 1,
      MUTE_DURATIONS.length
    );

    // Get appropriate mute duration
    const muteDuration = MUTE_DURATIONS[protection.warningLevel - 1];
    protection.mutedUntil = now + muteDuration;

    // Format mute duration for display
    let formattedDuration: string;
    if (muteDuration < 60 * 60 * 1000) {
      formattedDuration = `${muteDuration / 60000} minute(s)`;
    } else if (muteDuration < 24 * 60 * 60 * 1000) {
      formattedDuration = `${muteDuration / 3600000} hour(s)`;
    } else {
      formattedDuration = `${muteDuration / 86400000} day(s)`;
    }

    // Handle based on warning level
    if (protection.warningLevel >= MUTE_DURATIONS.length) {
      // Ban user on max warning level
      try {
        if (ctx.chat.type !== 'private') {
          await ctx.banChatMember(userId);
          await ctx.reply('User has been banned for excessive spamming.');
        } else {
          await ctx.reply(
            'You have been blocked for excessive spamming. Contact an administrator if you believe this is an error.'
          );
        }
      } catch (error) {
        console.error('Error banning user:', error);
        await ctx.reply('Failed to ban user due to insufficient permissions.');
      }
    } else {
      // Mute user
      try {
        if (ctx.chat.type !== 'private') {
          await ctx.restrictChatMember(userId, {
            can_send_messages: false,
            can_send_audios: false,
            can_send_documents: false,
            can_send_photos: false,
            can_send_videos: false,
            can_send_video_notes: false,
            can_send_voice_notes: false,
            can_send_polls: false,
            can_send_other_messages: false,
            can_add_web_page_previews: false,
            can_change_info: false,
            can_invite_users: false,
            can_pin_messages: false,
            can_manage_topics: false,
          });
        }

        // Notify the user
        await ctx.reply(
          `You are sending messages too quickly. You have been muted for ${formattedDuration}. This is warning ${protection.warningLevel}/${MUTE_DURATIONS.length}. Further violations will result in longer restrictions.`
        );
      } catch (error) {
        console.error('Error muting user:', error);
        // Still track the mute in our system even if Telegram API fails
      }
    }

    // Reset message count
    protection.messageCount = 0;
    return; // Don't process the message
  }

  // Update last message time
  protection.lastMessageTime = now;

  // Continue to next middleware
  return next();
};
