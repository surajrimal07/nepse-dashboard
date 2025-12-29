// export type JobType = 'once' | 'recurring'
// export type AlarmPurpose = 'scraping' | 'remind-later'

// export interface Job {
//   id: string
//   type: JobType
//   purpose: AlarmPurpose
//   date: number // timestamp in milliseconds
//   execute: () => void
//   periodInMinutes?: number // for recurring jobs
//   metadata?: any // any additional data needed for the job
// }

// interface StoredAlarm {
//   id: string
//   type: JobType
//   purpose: AlarmPurpose
//   date: number
//   periodInMinutes?: number
//   scheduledTime: number
//   metadata?: any
// }

// export class AlarmService {
//   private static instance: AlarmService
//   private readonly STORAGE_KEY = 'nepse-dashboard-alarms'
//   private jobs: Map<string, Job> = new Map()
//   private isInitialized = false

//   private constructor() {
//     // Setup alarm listener
//     chrome.alarms.onAlarm.addListener(this.handleAlarm.bind(this))
//   }

//   public static getInstance(): AlarmService {
//     if (!AlarmService.instance) {
//       AlarmService.instance = new AlarmService()
//     }
//     return AlarmService.instance
//   }

//   /**
//    * Initialize the alarm service - restore alarms from storage and recreate if missing
//    */
//   public async onInitialize(): Promise<void> {
//     if (this.isInitialized) {
//       return
//     }

//     try {
//       // Get stored alarms from Chrome storage
//       const { [this.STORAGE_KEY]: storedAlarms = [] } = await chrome.storage.local.get(this.STORAGE_KEY)
//       const alarms: StoredAlarm[] = storedAlarms

//       // Get active alarms from Chrome API
//       const chromeAlarms = await chrome.alarms.getAll()
//       const chromeAlarmNames = new Set(chromeAlarms.map(alarm => alarm.name))

//       // Check each stored alarm and recreate if missing
//       for (const storedAlarm of alarms) {
//         if (!chromeAlarmNames.has(storedAlarm.id)) {
//           // Alarm is missing, recreate it
//           await this.recreateAlarm(storedAlarm)
//         }
//       }

//       // Clean up storage - remove alarms that are expired and one-time
//       const currentTime = Date.now()
//       const validAlarms = alarms.filter((alarm) => {
//         if (alarm.type === 'once' && alarm.scheduledTime < currentTime) {
//           return false // Remove expired one-time alarms
//         }
//         return true
//       })

//       // Update storage if we removed any expired alarms
//       if (validAlarms.length !== alarms.length) {
//         await chrome.storage.local.set({ [this.STORAGE_KEY]: validAlarms })
//       }

//       this.isInitialized = true
//     }
//     catch (error) {
//       console.error('Failed to initialize alarm service:', error)
//     }
//   }

//   /**
//    * Create a new alarm based on job configuration
//    */
//   public async createAlarm(job: Job): Promise<boolean> {
//     try {
//       // Store the job for later execution
//       this.jobs.set(job.id, job)

//       // Calculate timing
//       const currentTime = Date.now()
//       const targetTime = job.date

//       // Ensure minimum 30 second delay as per Chrome API requirements
//       const minDelay = 0.5 // 30 seconds in minutes
//       const delayInMs = Math.max(targetTime - currentTime, 30000) // minimum 30 seconds
//       const delayInMinutes = delayInMs / 60000

//       // Create alarm info
//       const alarmInfo: chrome.alarms.AlarmCreateInfo = {
//         delayInMinutes: Math.max(delayInMinutes, minDelay),
//       }

//       // Add period for recurring alarms
//       if (job.type === 'recurring' && job.periodInMinutes) {
//         alarmInfo.periodInMinutes = Math.max(job.periodInMinutes, minDelay)
//       }

//       // Create the Chrome alarm
//       await chrome.alarms.create(job.id, alarmInfo)

//       // Store alarm data for persistence
//       const storedAlarm: StoredAlarm = {
//         id: job.id,
//         type: job.type,
//         purpose: job.purpose,
//         date: job.date,
//         periodInMinutes: job.periodInMinutes,
//         scheduledTime: currentTime + delayInMs,
//         metadata: job.metadata,
//       }

//       await this.saveAlarmToStorage(storedAlarm)

//       return true
//     }
//     catch (error) {
//       console.error(`Failed to create alarm ${job.id}:`, error)
//       return false
//     }
//   }

//   /**
//    * Clear a specific alarm by ID
//    */
//   public async clearAlarm(alarmId: string): Promise<boolean> {
//     try {
//       // Clear from Chrome alarms
//       const wasCleared = await chrome.alarms.clear(alarmId)

//       // Remove from local jobs map
//       this.jobs.delete(alarmId)

//       // Remove from storage
//       await this.removeAlarmFromStorage(alarmId)

//       return wasCleared
//     }
//     catch (error) {
//       console.error(`Failed to clear alarm ${alarmId}:`, error)
//       return false
//     }
//   }

//   /**
//    * Handle alarm events from Chrome API
//    */
//   private handleAlarm(alarm: chrome.alarms.Alarm): void {
//     const job = this.jobs.get(alarm.name)

//     if (job) {
//       try {
//         // Execute based on alarm purpose
//         this.executeAlarmAction(job)

//         // If it's a one-time alarm, clean it up
//         if (job.type === 'once') {
//           this.clearAlarm(alarm.name)
//         }
//       }
//       catch (error) {
//         console.error(`Error executing alarm ${alarm.name}:`, error)
//       }
//     }
//     else {
//       console.warn(`No job found for alarm: ${alarm.name}`)
//     }
//   }

//   /**
//    * Execute the appropriate action based on alarm purpose
//    */
//   private async executeAlarmAction(job: Job): Promise<void> {
//     switch (job.purpose) {
//       case 'scraping':
//         console.warn(`🕷️ Scraping alarm triggered: ${job.id}`)
//         job.execute()
//         break
//       case 'remind-later':
//         console.warn(`⏰ Remind later alarm triggered: ${job.id}`)
//         job.execute()
//         break
//       default:
//         console.warn(`Unknown alarm purpose: ${job.purpose}`)
//     }
//   }

//   /**
//    * Recreate an alarm from stored data
//    */
//   private async recreateAlarm(storedAlarm: StoredAlarm): Promise<void> {
//     try {
//       const currentTime = Date.now()

//       // For one-time alarms, check if they've already passed
//       if (storedAlarm.type === 'once' && storedAlarm.scheduledTime < currentTime) {
//         // Don't recreate expired one-time alarms
//         return
//       }

//       // Calculate new delay
//       const delayInMs = Math.max(storedAlarm.scheduledTime - currentTime, 30000)
//       const delayInMinutes = Math.max(delayInMs / 60000, 0.5)

//       const alarmInfo: chrome.alarms.AlarmCreateInfo = {
//         delayInMinutes,
//       }

//       if (storedAlarm.type === 'recurring' && storedAlarm.periodInMinutes) {
//         alarmInfo.periodInMinutes = Math.max(storedAlarm.periodInMinutes, 0.5)
//       }

//       await chrome.alarms.create(storedAlarm.id, alarmInfo)

//       // Note: We cannot recreate the execute function from storage
//       // The calling code will need to re-register jobs with their execute functions
//       console.warn(`Recreated alarm ${storedAlarm.id} - execute function needs to be re-registered`)
//     }
//     catch (error) {
//       console.error(`Failed to recreate alarm ${storedAlarm.id}:`, error)
//     }
//   }

//   /**
//    * Save alarm data to Chrome storage
//    */
//   private async saveAlarmToStorage(alarm: StoredAlarm): Promise<void> {
//     try {
//       const { [this.STORAGE_KEY]: existingAlarms = [] } = await chrome.storage.local.get(this.STORAGE_KEY)
//       const alarms: StoredAlarm[] = existingAlarms

//       // Remove existing alarm with same ID and add new one
//       const filteredAlarms = alarms.filter(a => a.id !== alarm.id)
//       filteredAlarms.push(alarm)

//       await chrome.storage.local.set({ [this.STORAGE_KEY]: filteredAlarms })
//     }
//     catch (error) {
//       console.error('Failed to save alarm to storage:', error)
//     }
//   }

//   /**
//    * Remove alarm data from Chrome storage
//    */
//   private async removeAlarmFromStorage(alarmId: string): Promise<void> {
//     try {
//       const { [this.STORAGE_KEY]: existingAlarms = [] } = await chrome.storage.local.get(this.STORAGE_KEY)
//       const alarms: StoredAlarm[] = existingAlarms

//       const filteredAlarms = alarms.filter(alarm => alarm.id !== alarmId)
//       await chrome.storage.local.set({ [this.STORAGE_KEY]: filteredAlarms })
//     }
//     catch (error) {
//       console.error('Failed to remove alarm from storage:', error)
//     }
//   }

//   /**
//    * Get all active alarms (for debugging)
//    */
//   public async getAllAlarms(): Promise<chrome.alarms.Alarm[]> {
//     try {
//       return await chrome.alarms.getAll()
//     }
//     catch (error) {
//       console.error('Failed to get all alarms:', error)
//       return []
//     }
//   }

//   /**
//    * Clear all alarms
//    */
//   public async clearAllAlarms(): Promise<boolean> {
//     try {
//       const wasCleared = await chrome.alarms.clearAll()
//       this.jobs.clear()
//       await chrome.storage.local.remove(this.STORAGE_KEY)
//       return wasCleared
//     }
//     catch (error) {
//       console.error('Failed to clear all alarms:', error)
//       return false
//     }
//   }

//   /**
//    * Helper method to create a scraping alarm
//    */
//   public async createScrapingAlarm(
//     id: string,
//     date: number,
//     execute: () => void,
//     periodInMinutes?: number,
//     metadata?: any,
//   ): Promise<boolean> {
//     const job: Job = {
//       id,
//       type: periodInMinutes ? 'recurring' : 'once',
//       purpose: 'scraping',
//       date,
//       execute,
//       periodInMinutes,
//       metadata,
//     }

//     return this.createAlarm(job)
//   }

//   /**
//    * Helper method to create a remind-later alarm
//    */
//   public async createRemindLaterAlarm(
//     id: string,
//     date: number,
//     execute: () => void,
//     metadata?: any,
//   ): Promise<boolean> {
//     const job: Job = {
//       id,
//       type: 'once',
//       purpose: 'remind-later',
//       date,
//       execute,
//       metadata,
//     }

//     return this.createAlarm(job)
//   }
// }

// // Export convenience function for creating job scheduler
// export function createJobScheduler(_notification: any, type: JobType, date: number): void {
//   const alarmService = AlarmService.getInstance()

//   alarmService.createAlarm({
//     id: 'job1',
//     type,
//     purpose: 'scraping',
//     date,
//     execute: () => {
//       console.warn('Executed job once')
//     },
//   })
// }
