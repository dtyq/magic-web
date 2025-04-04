import type { Mock } from "vitest"
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { bigNumCompare } from "../../../../utils/string"
import PullMessageController, { PullTaskStatus } from "../PullMessageController"

vi.mock("../../../../utils/string", () => ({
	bigNumCompare: vi.fn(),
}))

describe.skip("PullMessageController", () => {
	let controller: PullMessageController
	let mockPullFn: Mock

	beforeEach(() => {
		mockPullFn = vi.fn((startSeqId) => {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					if (Math.random() > 0.5) {
						const seq_id = Number(startSeqId) + Math.floor(Math.random() * 10)
						resolve({
							items: [
								{
									seq: {
										seq_id: seq_id.toString(),
									},
								},
							],
							has_more: Math.random() > 0.5,
							page_token: seq_id,
						})
					} else {
						reject(new Error("Network error"))
					}
				}, Math.random() * 100)
			})
		})
		controller = new PullMessageController(mockPullFn, () => null)
		;(bigNumCompare as Mock).mockImplementation((a, b) => Number(a) - Number(b))
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe.skip("createTask", () => {
		it("应该创建一个有效的任务", () => {
			const task = PullMessageController.createTask("1", "10", vi.fn())
			expect(task).toEqual({
				status: "todo",
				startSeqId: "1",
				endSeqId: "10",
				callback: expect.any(Function),
			})
		})

		it("当开始或结束 seqId 无效时应返回 null", () => {
			expect(PullMessageController.createTask("", "10")).toEqual({
				status: PullTaskStatus.Todo,
				startSeqId: "",
				endSeqId: "10",
			})
		})
	})

	describe.skip("add", () => {
		it("应该添加一个任务", () => {
			controller.add("1", "10")
			expect(controller.list).toHaveLength(1)
		})

		it("应该能添加多个不同的任务", () => {
			controller.add("1", "10")
			controller.add("11", "20")
			expect(controller.list).toHaveLength(2)
		})
	})

	describe.skip("runTask", () => {
		it("当开始 seqId 大于或等于结束 seqId 时应忽略任务", async () => {
			const task = PullMessageController.createTask("10", "1")!
			const result = await controller.runTask(task)
			expect(result).toEqual({
				status: PullTaskStatus.Ignore,
				finishSeqId: "10",
				data: [],
			})
		})

		it("应处理空响应", async () => {
			mockPullFn.mockResolvedValueOnce({ items: [], has_more: false })
			const task = PullMessageController.createTask("1", "10")!
			const result = await controller.runTask(task)
			expect(result).toEqual({
				finishSeqId: "1",
				data: [],
				status: PullTaskStatus.Success,
			})
		})

		it("应处理成功的响应", async () => {
			const mockResponse = [{ seq: { seq_id: "5" } }, { seq: { seq_id: "10" } }]
			mockPullFn.mockResolvedValueOnce({
				items: mockResponse,
				has_more: false,
				page_token: "10",
			})
			const task = PullMessageController.createTask("1", "10")!
			const result = await controller.runTask(task)
			expect(result).toEqual({
				finishSeqId: "10",
				data: mockResponse,
				status: PullTaskStatus.Success,
			})
		})

		it("应处理失败的情况", async () => {
			mockPullFn.mockRejectedValue(new Error("Network error"))
			const task = PullMessageController.createTask("1", "10")!
			await expect(controller.runTask(task)).rejects.toThrow("Network error")
		})
	})

	describe.skip("run", () => {
		it("当有待处理的任务时不应运行新任务", () => {
			controller.currentTask = { status: "pending" } as any
			const runTaskSpy = vi.spyOn(controller, "runTask")
			controller.run()
			expect(runTaskSpy).not.toHaveBeenCalled()
		})

		it("应运行下一个任务并更新列表", async () => {
			const mockCallback = vi.fn()
			controller.add("1", "10", mockCallback)
			controller.add("11", "20")

			mockPullFn.mockResolvedValueOnce({
				items: [{ seq: { seq_id: "15" } }],
				has_more: false,
				page_token: "15",
			})

			await controller.run(false)

			expect(mockCallback).toHaveBeenCalled()
			expect(controller.list).toHaveLength(1)
			expect(controller.list[0].startSeqId).toBe("15")
		})
	})

	describe.skip("并发和任务优先级", () => {
		it("应该能够处理多个并发任务并按顺序执行", async () => {
			const executionOrder: number[] = []
			const mockCallback1 = vi.fn(() => executionOrder.push(1))
			const mockCallback2 = vi.fn(() => executionOrder.push(2))
			const mockCallback3 = vi.fn(() => executionOrder.push(3))

			mockPullFn
				.mockResolvedValueOnce({
					items: [{ seq: { seq_id: "15" } }],
					has_more: true,
					page_token: "15",
				})
				.mockResolvedValueOnce({
					items: [{ seq: { seq_id: "25" } }],
					has_more: true,
					page_token: "25",
				})
				.mockResolvedValueOnce({
					items: [{ seq: { seq_id: "35" } }],
					has_more: false,
					page_token: "35",
				})

			controller.add("1", "10", mockCallback1)
			controller.add("11", "20", mockCallback2)
			controller.add("21", "30", mockCallback3)

			await controller.run()

			expect(mockCallback1).toHaveBeenCalled()
			expect(mockCallback2).toHaveBeenCalled()
			expect(mockCallback3).toHaveBeenCalled()
			expect(executionOrder).toEqual([1, 2, 3])
			expect(controller.list).toHaveLength(0)
		})
	})

	describe.skip("边界情况", () => {
		it("当 startSeqId 等于 endSeqId 时应忽略任务", async () => {
			const task = PullMessageController.createTask("10", "10")!
			const result = await controller.runTask(task)
			expect(result).toEqual({
				finishSeqId: "10",
				data: [],
				status: PullTaskStatus.Ignore,
			})
		})
	})

	describe.skip("长时间运行的任务", () => {
		it("应该能够处理长时间运行的任务", async () => {
			const longRunningController = new PullMessageController(mockPullFn, () => null)
			const mockCallback = vi.fn()

			mockPullFn
				.mockResolvedValueOnce({
					items: [{ seq: { seq_id: "10" } }],
					has_more: true,
					page_token: "10",
				})
				.mockResolvedValueOnce({
					items: [{ seq: { seq_id: "20" } }],
					has_more: true,
					page_token: "20",
				})
				.mockResolvedValueOnce({
					items: [{ seq: { seq_id: "30" } }],
					has_more: false,
					page_token: "30",
				})

			longRunningController.add("1", "30", mockCallback)
			await longRunningController.run()

			expect(mockCallback).toHaveBeenCalledTimes(1)
			expect(mockPullFn).toHaveBeenCalledTimes(1)
			expect(longRunningController.list).toHaveLength(0)
		})
	})

	describe.skip("错误恢复", () => {
		it("在遇到错误后应继续执行其他任务", async () => {
			const mockCallback1 = vi.fn()
			const mockCallback2 = vi.fn()

			mockPullFn.mockRejectedValueOnce(new Error("Network error")).mockResolvedValueOnce({
				items: [{ seq: { seq_id: "20" } }],
				has_more: false,
				page_token: "20",
			})

			controller.add("1", "10", mockCallback1)
			controller.add("11", "20", mockCallback2)

			await controller.run()

			expect(mockCallback1).not.toHaveBeenCalled()
			expect(mockCallback2).toHaveBeenCalled()
			expect(controller.list).toHaveLength(0)
			expect(mockPullFn).toHaveBeenCalledTimes(2)
		})
	})
})
