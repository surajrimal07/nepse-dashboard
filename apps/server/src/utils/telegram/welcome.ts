import type { MiddlewareFn } from 'grammy';
import type { BotContext } from './types';

/**
 * Middleware to welcome new members to a group
 * Sends a customized welcome message with group rules
 */
export const welcomeMiddleware: MiddlewareFn<BotContext> = async (
  ctx,
  next
) => {
  // Check if this is a new chat member event
  if (
    ctx.message?.new_chat_members &&
    ctx.message.new_chat_members.length > 0
  ) {
    try {
      // Get chat information
      const chat = ctx.chat;
      if (!chat) {
        return next();
      }

      // Get the new members
      const newMembers = ctx.message.new_chat_members;

      // Skip if the new member is the bot itself
      if (
        newMembers.some(
          (member) => member.is_bot && member.username === ctx.me.username
        )
      ) {
        return next();
      }

      // Create personalized welcome messages for each new member
      for (const member of newMembers) {
        const firstName = member.first_name;
        const username = member.username ? `@${member.username}` : firstName;

        // Create the welcome message
        const welcomeMessage = `👋 Welcome to <b>${chat.title}</b>, ${username}!

<b>Please take a moment to:</b>
• Read our group rules
• Be respectful to all members
• Stay on topic with discussions
• Avoid spam and excessive messages
• Use appropriate language

If you have any questions, feel free to ask an admin or moderator.

Enjoy your time in the group! 🎉`;

        // Send the welcome message
        await ctx.reply(welcomeMessage, {
          parse_mode: 'HTML',
          // Reply to the join message
          reply_to_message_id: ctx.message.message_id,
        });

        // Optional: You can also send group-specific rules if available
        // This could be fetched from a database based on the chat.id
      }
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  }

  // Continue to next middleware
  return next();
};
