import type { KnowledgeStatus } from "@/opensource/pages/flow/nodes/KnowledgeSearch/v0/constants"
import type { KnowledgeType } from "@/opensource/pages/flow/nodes/KnowledgeSearch/v0/types"
import type { OperationTypes } from "@/opensource/pages/flow/components/AuthControlButton/types"

/** 知识库相关类型 */
export namespace Knowledge {
	/** 单个知识库详情 */
	export interface Detail {
		id: string
		name: string
		description: string
		type: number
		enabled: boolean
		sync_status: number
		sync_status_message: string
		model: string
		vector_db: string
		organization_code: string
		creator: string
		created_at: string
		modifier: string
		updated_at: string
		fragment_count: number
		expected_count: number
		completed_count: number
		user_operation: OperationTypes
	}

	/** 单个知识库列表项 */
	export interface KnowledgeItem {
		id: string
		name: string
		description: string
		type: number
		enabled: boolean
		sync_status: number
		sync_status_message: string
		model: string
		vector_db: string
		organization_code: string
		creator: string
		created_at: string
		modifier: string
		updated_at: string
		user_operation: OperationTypes
		creator_info: {
			id: string
			name: string
			avatar: string
		}
		modifier_info: {
			id: string
			name: string
			avatar: string
		}
	}

	/** 单个片段 */
	export interface FragmentItem {
		id: string
		knowledge_code: string
		content: string
		metadata: Record<string, string | number>
		sync_status: number
		sync_status_message: string
		creator: string
		created_at: string
		modifier: string
		updated_at: string
		business_id: string
	}

	export type GetKnowledgeListParams = {
		name: string
		page: number
		pageSize: number
	}

	export type SaveKnowledgeParams = Partial<
		Pick<
			KnowledgeItem,
			"id" | "name" | "description" | "type" | "model" | "enabled" | "vector_db"
		>
	>

	export type MatchKnowledgeParams = Pick<
		KnowledgeItem,
		"name" | "description" | "type" | "model"
	>

	export type GetFragmentListParams = {
		knowledgeCode: string
		page: number
		pageSize: number
	}

	export type SaveFragmentParams = Partial<{
		id: string
		knowledge_code: string
		content: string
		metadata: FragmentItem["metadata"]
		business_id: FragmentItem["business_id"]
	}>

	// 天书知识库单个项
	export type TeamshareKnowledgeItem = {
		knowledge_code: string
		knowledge_type: KnowledgeType
		business_id: string
		name: string
		description: string
	}

	// 请求进度的Params
	export type GetTeamshareKnowledgeProgressParams = {
		knowledge_codes: string[]
	}

	export type CreateTeamshareKnowledgeVectorParams = {
		knowledge_id: string
	}

	export interface TeamshareKnowledgeProgress extends TeamshareKnowledgeItem {
		vector_status: KnowledgeStatus
		expected_num: number
		completed_num: number
	}
}
