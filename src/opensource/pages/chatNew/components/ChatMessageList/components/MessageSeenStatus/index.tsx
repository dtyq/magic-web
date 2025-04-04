import MagicIcon from "@/opensource/components/base/MagicIcon"
import { MessageReceiveType } from "@/types/chat"
import { resolveToString } from "@dtyq/es6-template-strings"

import { IconEye, IconEyeCheck } from "@tabler/icons-react"
import { Flex } from "antd"
import { createStyles } from "antd-style"
import { useTranslation } from "react-i18next"
import { SendStatus } from "@/types/chat/conversation_message"
import { memo } from "react"
import MessageStore from "@/opensource/stores/chatNew/message"
import { observer } from "mobx-react-lite"
import ConversationStore from "@/opensource/stores/chatNew/conversation"
import GroupMessageSeenPopover from "./GroupMessageSeenPopover"

interface MessageStatusProps {
	unreadCount: number
	messageId: string
	// conversation?: Conversation | null
	// status?: ConversationMessageStatus
}

const useStyles = createStyles(({ css, isDarkMode, token }) => ({
	icon: {
		color: isDarkMode ? token.magicColorScales.grey[6] : token.magicColorUsages.text[3],
	},
	text: css`
		color: ${isDarkMode ? token.magicColorScales.grey[6] : token.magicColorUsages.text[3]};
		text-align: justify;
		font-size: 12px;
		font-style: normal;
		font-weight: 400;
		line-height: 16px;
		user-select: none;
	`,
}))

// icon独立，避免重复渲染
const StatusIcon = memo(function StatusIcon({
	icon: Icon,
	className,
}: {
	icon: typeof IconEye | typeof IconEyeCheck
	className: string
}) {
	return <MagicIcon component={Icon} size={16} className={className} />
})

// 文本独立，避免重复渲染
const StatusText = memo(function StatusText({
	text,
	className,
}: {
	text: string
	className: string
}) {
	return <span className={className}>{text}</span>
})

// 内容独立，避免重复渲染
const StatusContent = memo(function StatusContent({
	icon: Icon,
	text,
	styles,
}: {
	icon: typeof IconEye | typeof IconEyeCheck
	text: string
	styles: ReturnType<typeof useStyles>["styles"]
}) {
	return (
		<Flex align="center" justify="flex-end" gap={2}>
			<StatusIcon icon={Icon} className={styles.icon} />
			<StatusText text={text} className={styles.text} />
		</Flex>
	)
})

function MessageSeenStatus({ unreadCount, messageId }: MessageStatusProps) {
	const { t } = useTranslation("interface")
	const { styles } = useStyles()
	const { currentConversation } = ConversationStore

	// 发送失败，不显示
	if (MessageStore.sendStatusMap.get(messageId) === SendStatus.Failed) {
		return null
	}

	switch (currentConversation?.receive_type) {
		case MessageReceiveType.Ai:
		case MessageReceiveType.User:
			switch (true) {
				// 优先判断消息状态
				case unreadCount > 0:
					return <StatusContent icon={IconEye} text={t("chat.unread")} styles={styles} />

				case unreadCount === 0:
					return (
						<StatusContent icon={IconEyeCheck} text={t("chat.read")} styles={styles} />
					)

				default:
					return null
			}
		case MessageReceiveType.Group:
			switch (true) {
				case unreadCount === 0:
					return (
						<GroupMessageSeenPopover messageId={messageId}>
							<StatusContent
								icon={IconEyeCheck}
								text={t("chat.allRead")}
								styles={styles}
							/>
						</GroupMessageSeenPopover>
					)
				case unreadCount > 0:
					return (
						<GroupMessageSeenPopover messageId={messageId}>
							<StatusContent
								icon={IconEye}
								text={resolveToString(t("chat.unseenCount"), {
									count: unreadCount,
								})}
								styles={styles}
							/>
						</GroupMessageSeenPopover>
					)
				default:
					return null
			}
		default:
			return null
	}
}

export default observer(MessageSeenStatus)
