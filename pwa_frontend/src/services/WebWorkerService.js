/**
 * WebWorkerService - Manages Web Worker lifecycle and communication
 * 
 * This service orchestrates background AI processing to keep the main UI thread responsive
 * during intensive computations like rPPG signal processing and TensorFlow.js inference.
 */

class WebWorkerService {
  constructor() {
    this.workers = new Map()
    this.messageId = 0
    this.pendingPromises = new Map()
  }

  /**
   * Create and register a Web Worker
   * @param {string} name - Worker identifier (e.g., 'rppg', 'ocular')
   * @param {string} scriptPath - Path to worker script
   */
  async createWorker(name, scriptPath) {
    if (this.workers.has(name)) {
      console.warn(`Worker ${name} already exists`)
      return this.workers.get(name)
    }

    try {
      const worker = new Worker(new URL(scriptPath, import.meta.url), {
        type: 'module'
      })

      worker.onmessage = (event) => this.handleWorkerMessage(name, event)
      worker.onerror = (error) => this.handleWorkerError(name, error)
      
      this.workers.set(name, worker)
      console.log(`✅ Worker ${name} created successfully`)
      return worker
    } catch (error) {
      console.error(`❌ Failed to create worker ${name}:`, error)
      throw error
    }
  }

  /**
   * Send message to a specific worker and return a Promise for the response
   * @param {string} workerName - Name of the target worker
   * @param {string} command - Command to execute
   * @param {object} data - Data payload
   * @returns {Promise} Promise that resolves with worker response
   */
  async sendMessage(workerName, command, data = {}) {
    const worker = this.workers.get(workerName)
    if (!worker) {
      throw new Error(`Worker ${workerName} not found`)
    }

    const messageId = ++this.messageId
    const message = { id: messageId, command, data }

    return new Promise((resolve, reject) => {
      this.pendingPromises.set(messageId, { resolve, reject })
      
      // Set timeout for long-running operations
      const timeout = setTimeout(() => {
        this.pendingPromises.delete(messageId)
        reject(new Error(`Worker ${workerName} timeout for command: ${command}`))
      }, 60000) // 60 second timeout

      this.pendingPromises.get(messageId).timeout = timeout
      worker.postMessage(message)
    })
  }

  /**
   * Handle messages from workers
   */
  handleWorkerMessage(workerName, event) {
    const { id, success, result, error, progress } = event.data

    if (progress !== undefined) {
      // Handle progress updates (don't resolve promise yet)
      this.onProgress?.(workerName, progress)
      return
    }

    const pending = this.pendingPromises.get(id)
    if (!pending) return

    clearTimeout(pending.timeout)
    this.pendingPromises.delete(id)

    if (success) {
      pending.resolve(result)
    } else {
      pending.reject(new Error(error || `Worker ${workerName} task failed`))
    }
  }

  /**
   * Handle worker errors
   */
  handleWorkerError(workerName, error) {
    console.error(`Worker ${workerName} error:`, error)
    this.onError?.(workerName, error)
  }

  /**
   * Transfer ArrayBuffer to worker (zero-copy)
   * @param {string} workerName - Target worker
   * @param {string} command - Command
   * @param {object} data - Data with transferable objects
   * @param {Array} transferList - List of transferable objects
   */
  async sendTransferableMessage(workerName, command, data, transferList = []) {
    const worker = this.workers.get(workerName)
    if (!worker) {
      throw new Error(`Worker ${workerName} not found`)
    }

    const messageId = ++this.messageId
    const message = { id: messageId, command, data }

    return new Promise((resolve, reject) => {
      this.pendingPromises.set(messageId, { resolve, reject })
      worker.postMessage(message, transferList)
    })
  }

  /**
   * Terminate a specific worker
   */
  terminateWorker(name) {
    const worker = this.workers.get(name)
    if (worker) {
      worker.terminate()
      this.workers.delete(name)
      console.log(`Worker ${name} terminated`)
    }
  }

  /**
   * Terminate all workers
   */
  terminateAll() {
    for (const [name, worker] of this.workers) {
      worker.terminate()
      console.log(`Worker ${name} terminated`)
    }
    this.workers.clear()
    this.pendingPromises.clear()
  }

  /**
   * Check if a worker is available
   */
  hasWorker(name) {
    return this.workers.has(name)
  }

  /**
   * Set progress callback
   */
  setProgressCallback(callback) {
    this.onProgress = callback
  }

  /**
   * Set error callback
   */
  setErrorCallback(callback) {
    this.onError = callback
  }
}

// Singleton instance
export const webWorkerService = new WebWorkerService()

export default WebWorkerService