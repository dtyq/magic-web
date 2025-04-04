import MagicButton from "@/opensource/components/base/MagicButton"
import MagicIcon from "@/opensource/components/base/MagicIcon"
import { IconUserCog } from "@tabler/icons-react"
import { useTranslation } from "react-i18next"
import { RoutePath } from "@/const/routes"
import { useMemoizedFn, useMount } from "ahooks"
import { useNavigate } from "@/opensource/hooks/useNavigate"
import { replaceRouteParams } from "@/utils/route"
import { useState } from "react"
import type { StructureUserItem } from "@/types/organization"
import { hasEditRight } from "@/opensource/pages/flow/components/AuthControlButton/types"
import { FlowRouteType } from "@/types/flow"
import { observer } from "mobx-react-lite"
import conversationStore from "@/opensource/stores/chatNew/conversation"
import { ContactApi } from "@/opensource/apis"
import UserPopoverContent from "./user"

const AiPopoverContent = observer(({ conversationId }: { conversationId: string }) => {
	const { t } = useTranslation("interface")
	const navigate = useNavigate()
	const [ai, setAI] = useState<StructureUserItem>()

	const { conversations } = conversationStore
	const conversation = conversations[conversationId]

	const initAIInfo = useMemoizedFn(async () => {
		if (!conversation) return
		const users = await ContactApi.getUserInfos({
			user_ids: [conversation.receive_id],
			query_type: 1,
		})
		setAI(users?.items?.[0])
	})

	useMount(() => {
		initAIInfo()
	})

	const navigateToWorkflow = useMemoizedFn(async () => {
		navigate(
			replaceRouteParams(RoutePath.FlowDetail, {
				id: ai?.bot_info?.bot_id || "",
				type: FlowRouteType.Agent,
			}),
		)
	})

	return (
		<>
			{/* <PraiseButton /> */}
			{hasEditRight(ai?.bot_info?.user_operation!) && (
				<MagicButton
					justify="flex-start"
					icon={<MagicIcon component={IconUserCog} size={20} />}
					size="large"
					type="text"
					block
					onClick={navigateToWorkflow}
				>
					{t("chat.floatButton.aiAssistantConfiguration")}
				</MagicButton>
			)}
			{/* <div style={{ height: 1, background: colorUsages.border }} /> */}
			<UserPopoverContent conversationId={conversationId} />
		</>
	)
})

export default AiPopoverContent
