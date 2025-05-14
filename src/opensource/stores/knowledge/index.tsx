import { RequestUrl } from "@/opensource/apis/constant"
import type { WithPage } from "@/types/flow"
import type { Knowledge } from "@/types/knowledge"
import type { SWRResponse } from "swr"
import useSWR from "swr"
import { create } from "zustand"
import { KnowledgeApi } from "@/apis"

interface KnowledgeStore {
	knowledgeList: Knowledge.KnowledgeItem[]
	useKnowledgeList: (
		params: Knowledge.GetKnowledgeListParams,
	) => SWRResponse<WithPage<Knowledge.KnowledgeItem[]>>
	useKnowledgeDetail: (id: string) => SWRResponse<Knowledge.Detail>
	useFragmentList: (
		params: Knowledge.GetFragmentListParams,
	) => SWRResponse<WithPage<Knowledge.FragmentItem[]>>
}
export const useKnowledgeStore = create<KnowledgeStore>((set) => ({
	knowledgeList: [],
	useKnowledgeList: ({ name, page, pageSize = 100 }: Knowledge.GetKnowledgeListParams) => {
		return useSWR(
			RequestUrl.getKnowledgeList,
			() =>
				KnowledgeApi.getKnowledgeList({
					name,
					page,
					pageSize,
				}),
			{
				onSuccess(d: WithPage<Knowledge.KnowledgeItem[]>) {
					if (d.list) {
						set(() => ({
							knowledgeList: d.list,
						}))
					}
				},
			},
		)
	},

	useKnowledgeDetail: (id: string) => {
		return useSWR(`${RequestUrl.getKnowLedgeDetail}/${id}`, () =>
			KnowledgeApi.getKnowledgeDetail(id),
		)
	},

	useFragmentList: (params: Knowledge.GetFragmentListParams) => {
		return useSWR(`${RequestUrl.getFragmentList}`, () => KnowledgeApi.getFragmentList(params))
	},
}))
