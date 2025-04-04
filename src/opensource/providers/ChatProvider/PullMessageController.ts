/**
 * 废弃文件
 */
import type { ChatApi } from "@/apis"
import type { SeqResponse } from "@/types/request"
import type { CMessage } from "@/types/chat"
import { bigNumCompare } from "@/utils/string"

export const enum PullTaskStatus {
	Todo = "todo",
	Pending = "pending",
	Success = "success",
	Failed = "failed",
	Ignore = "ignore",
}

type PullTaskCallback = (data: unknown) => unknown | Promise<unknown>

interface PullTask {
	status: PullTaskStatus
	startSeqId: string
	endSeqId?: string
	callback?: PullTaskCallback
}

interface PullResponse {
	status: PullTaskStatus
	finishSeqId: string
	data: { type: "seq"; seq: SeqResponse<CMessage> }[]
}

/**
 * 拉取消息控制器
 */
class PullMessageController {
	list: PullTask[] = []

	currentTask: PullTask | null = null

	pullFn: (typeof ChatApi)["messagePull"]

	getChatStore: () => ChatStore | null

	constructor(pullFn: (typeof ChatApi)["messagePull"], getChatStore: () => ChatStore | null) {
		this.list = []
		this.currentTask = null
		this.pullFn = pullFn
		this.getChatStore = getChatStore

		// 创建节流函数，每200ms最多执行一次
		// this.processThrottled = debounce(this.processRenderQueue.bind(this), 100)
	}

	/**
	 * 创建一个任务
	 * @param startSeqId 开始seqId
	 * @param endSeqId 结束seqId
	 * @param callback 回调函数
	 * @returns
	 */
	static createTask(startSeqId: string, endSeqId?: string, callback?: PullTaskCallback) {
		return {
			status: PullTaskStatus.Todo,
			startSeqId: startSeqId || "",
			endSeqId,
			callback,
		}
	}

	/**
	 * 添加一个任务
	 * @param startSeqId 开始seqId
	 * @param endSeqId 结束seqId
	 * @param callback 回调函数
	 */
	add(startSeqId: string, endSeqId?: string, callback?: PullTaskCallback) {
		const task = PullMessageController.createTask(startSeqId, endSeqId, callback)

		if (!task) {
			return
		}
		// 检查是否存在重复任务
		const isDuplicate = this.list.some(
			(existingTask) =>
				existingTask.startSeqId === task.startSeqId &&
				existingTask.endSeqId === task.endSeqId,
		)
		if (!isDuplicate) {
			this.list.push(task)
		}
	}

	/**
	 * 执行任务
	 * @param task 任务
	 * @returns
	 */
	async runTask(task: PullTask): Promise<PullResponse> {
		if (task.endSeqId && bigNumCompare(task.startSeqId, task.endSeqId) >= 0) {
			// 开始序号大于结束序号，忽略
			return {
				status: PullTaskStatus.Ignore,
				finishSeqId: task.startSeqId,
				data: [],
			}
		}

		const res = await this.pullFn({ page_token: task.startSeqId })

		if (res.items.length === 0) {
			return {
				status: PullTaskStatus.Success,
				finishSeqId: task.startSeqId,
				data: res.items,
			}
		}
		const lastMessage = res.items[0]
		if (task.endSeqId && bigNumCompare(lastMessage.seq.seq_id, task.endSeqId) >= 0) {
			return {
				status: PullTaskStatus.Success,
				finishSeqId: lastMessage.seq.seq_id,
				data: res.items,
			}
		}

		return {
			status: PullTaskStatus.Success,
			finishSeqId: task.startSeqId,
			data: res.items,
		}
	}

	/**
	 * 执行下一个任务
	 */
	async run(continueTask: boolean = true): Promise<void> {
		if (this.currentTask && this.currentTask.status === PullTaskStatus.Pending) {
			return
		}

		if (this.list.length === 0) {
			return
		}

		const task = this.list.shift()!
		this.currentTask = task
		task.status = PullTaskStatus.Pending

		try {
			console.log("currentTask", this.currentTask, this.list)
			const res = await this.runTask(task)
			await task.callback?.(res.data)

			// 触发处理队列
			// this.getChatStore()?.getState().processRenderQueue()

			task.status = res.status

			this.list.forEach((item) => {
				// 如果任务的开始序号小于finishSeqId，则更新任务的开始序号
				if (bigNumCompare(item.startSeqId, res.finishSeqId) < 0) {
					item.startSeqId = res.finishSeqId
				}
			})
		} catch (err) {
			console.error(err)
			this.currentTask!.status = PullTaskStatus.Failed
		}

		this.currentTask = null
		if (continueTask) {
			await this.run()
		}
	}
}

export default PullMessageController
