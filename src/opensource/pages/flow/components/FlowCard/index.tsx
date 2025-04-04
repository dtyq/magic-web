import { Flex, Switch } from "antd"
import { useMemoizedFn } from "ahooks"
import type { MagicFlow } from "@dtyq/magic-flow/MagicFlow/types/flow"
import { memo, useMemo } from "react"
import PromptCard from "@/opensource/pages/explore/components/PromptCard"
import { IconCircleCheckFilled, IconAlertCircleFilled, IconTools } from "@tabler/icons-react"
import { cx } from "antd-style"
import type { FlowTool } from "@/types/flow"
import { FlowRouteType } from "@/types/flow"
import { useTranslation } from "react-i18next"
import { resolveToString } from "@dtyq/es6-template-strings"
import { colorScales } from "@/opensource/providers/ThemeProvider/colors"
import FlowTag from "../FlowTag"
import useStyles from "./style"
import OperateMenu from "../OperateMenu"
import { hasEditRight } from "../AuthControlButton/types"

type Flow = MagicFlow.Flow & {
	quote?: number
	icon?: string
	created_at?: string
	agent_used_count?: number
	tools?: FlowTool.Tool[]
}

type FlowCardProps = {
	data: Flow
	selected: boolean
	lineCount: number
	flowType?: FlowRouteType
	dropdownItems: React.ReactNode
	onCardClick: (flow: MagicFlow.Flow) => void
	updateEnable: (flow: Flow) => void
}

function Card({
	data,
	lineCount,
	selected,
	dropdownItems,
	onCardClick,
	updateEnable,
	flowType,
}: FlowCardProps) {
	const { styles } = useStyles()

	const { t } = useTranslation("interface")

	const updateInnerEnable = useMemoizedFn((_, e) => {
		e.stopPropagation()
		updateEnable(data)
	})

	const handleInnerClick = useMemoizedFn(() => {
		onCardClick?.(data)
	})

	const cardData = useMemo(() => {
		return {
			id: data.id,
			title: data.name,
			icon: data.icon,
			description: data.description,
		}
	}, [data])

	const tagRender = useMemo(() => {
		let quote
		let tools = 0
		if (flowType === FlowRouteType.Tools) {
			quote = data.agent_used_count ? data.agent_used_count : 0
			tools = data.tools ? data.tools.length : 0
		} else {
			quote = data.quote ? data.quote : 0
		}
		const quoteTag =
			quote > 0
				? [
						{
							key: "quote",
							text: resolveToString(t("agent.quoteAgent"), { num: quote || 0 }),
							icon: <IconCircleCheckFilled size={12} color={colorScales.green[4]} />,
						},
				  ]
				: [
						{
							key: "quote",
							text: t("agent.noQuote"),
							icon: <IconAlertCircleFilled size={12} color={colorScales.orange[5]} />,
						},
				  ]

		return flowType === FlowRouteType.Tools
			? [
					{
						key: "tool",
						text: resolveToString(t("flow.toolsNum"), { num: tools }),
						icon: <IconTools size={12} color={colorScales.brand[5]} />,
					},
					...quoteTag,
			  ]
			: quoteTag
	}, [data.agent_used_count, data.quote, data.tools, flowType, t])

	return (
		<Flex
			vertical
			className={cx(styles.cardWrapper, { [styles.checked]: selected })}
			gap={8}
			onClick={handleInnerClick}
		>
			<PromptCard type={flowType} data={cardData} lineCount={lineCount} height={9} />
			<Flex justify="space-between" align="center">
				<Flex gap={4} align="center">
					{tagRender.map((item) => {
						return (
							<FlowTag
								key={`${data.id}-${item.key}`}
								text={item.text}
								icon={item.icon}
							/>
						)
					})}
				</Flex>

				{hasEditRight(data.user_operation) && (
					<Flex gap={8} align="center" style={{ marginLeft: "auto" }}>
						{t("agent.status")}
						<Switch checked={data.enabled} onChange={updateInnerEnable} size="small" />
					</Flex>
				)}
			</Flex>
			<div>{`${t("agent.createTo")} ${data.created_at?.replace(/-/g, "/")}`}</div>
			{hasEditRight(data.user_operation) && (
				<div className={styles.moreOperations}>
					<OperateMenu menuItems={dropdownItems} useIcon />
				</div>
			)}
		</Flex>
	)
}

const FlowCard = memo((props: FlowCardProps) => {
	return (
		<OperateMenu
			trigger="contextMenu"
			placement="right"
			menuItems={props.dropdownItems}
			key={props.data.id}
		>
			<Card {...props} />
		</OperateMenu>
	)
})

export default FlowCard
