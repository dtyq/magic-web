import MagicSpin from "@/opensource/components/base/MagicSpin"
import MagicMemberAvatar from "@/opensource/components/business/MagicMemberAvatar"
import { resolveToString } from "@dtyq/es6-template-strings"

import { Popover, Flex } from "antd"
import { createStyles } from "antd-style"
import type { PropsWithChildren } from "react"
import { memo, useState } from "react"
import { useTranslation } from "react-i18next"
import useSWR from "swr"
import { ChatApi } from "@/opensource/apis"

const useGroupMessageSeenPopoverStyles = createStyles(({ css, token }) => ({
	content: css`
		width: 400px;
		border-top: 1px solid ${token.magicColorUsages.border};
		padding-top: 12px;
	`,
	text: css`
		color: ${token.magicColorUsages.text[0]};
		font-size: 14px;
		font-weight: 600;
		line-height: 20px;
		margin-bottom: 4px;
	`,
	section: css`
		flex: 1;
	`,
	list: css`
		max-height: 300px;
		overflow-y: auto;
	`,
	divider: css`
		width: 1px;
		max-height: 360px;
		margin: 0 12px;
		border-left: 1px solid ${token.magicColorUsages.border};
	`,
}))

const GroupMessageSeenPopover = memo(
	({ messageId, children }: PropsWithChildren<{ messageId: string }>) => {
		const { t } = useTranslation("interface")
		const [active, setActive] = useState(false)

		const { data: messageReceiveList, isLoading } = useSWR(
			messageId && active ? messageId : false,
			(msgId) => ChatApi.getMessageReceiveList(msgId),
		)

		const { styles } = useGroupMessageSeenPopoverStyles()

		return (
			<Popover
				arrow={false}
				title={t("chat.message.groupSeenPopover.title")}
				trigger="click"
				placement="right"
				autoAdjustOverflow
				onOpenChange={setActive}
				content={
					<MagicSpin spinning={isLoading}>
						<Flex className={styles.content}>
							<Flex vertical flex={1} gap={8} className={styles.section}>
								<span className={styles.text}>
									{resolveToString(t("chat.unseenCount"), {
										count: messageReceiveList?.unseen_list.length,
									})}
								</span>
								<Flex gap={8} vertical className={styles.list}>
									{messageReceiveList?.unseen_list.map((uid) => (
										<MagicMemberAvatar
											showPopover={false}
											showName="horizontal"
											key={uid}
											uid={uid}
											size={27}
										/>
									))}
								</Flex>
							</Flex>
							<div className={styles.divider} />
							<Flex vertical flex={1} gap={8} className={styles.section}>
								<span className={styles.text}>
									{resolveToString(t("chat.seenCount"), {
										count: messageReceiveList?.seen_list.length,
									})}
								</span>
								<Flex gap={8} vertical className={styles.list}>
									{messageReceiveList?.seen_list.map((uid) => (
										<MagicMemberAvatar
											showPopover={false}
											showName="horizontal"
											key={uid}
											uid={uid}
											size={27}
										/>
									))}
								</Flex>
							</Flex>
						</Flex>
					</MagicSpin>
				}
			>
				{children}
			</Popover>
		)
	},
)

export default GroupMessageSeenPopover
