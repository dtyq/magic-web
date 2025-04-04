import { useTranslation } from "react-i18next"
import { Flex } from "antd"
import { IconClockPlay } from "@tabler/icons-react"
import { IconMessageTopic } from "@/enhance/tabler/icons-react"
import { memo, useMemo } from "react"
import OperateMenu from "@/opensource/pages/flow/components/OperateMenu"
import type { UserTask } from "@/types/chat/task"
import { resolveToString } from "@dtyq/es6-template-strings"
import MagicIcon from "@/opensource/components/base/MagicIcon"
import { useTopicName } from "@/stores/chat-topic/hooks/useCurrentTopic"
import { useStyles } from "../TaskList/styles"
import { REPEAT_TYPE_DESC, RepeatTypeMap, Units, UNITS_DESC } from "../CreateTask/constant"

interface TaskItemProps {
	data: UserTask
	conversationId?: string
	menuItems: (id: UserTask) => React.ReactNode
}

const TaskItem = memo(({ conversationId, data, menuItems }: TaskItemProps) => {
	const { t } = useTranslation("interface")
	const { styles, cx } = useStyles()

	const taskDesc = useMemo(() => {
		const { type, day, time, value } = data
		let deadline = t("chat.timedTask.alwaysRepeat")
		if (value?.deadline) {
			deadline = resolveToString(t("chat.timedTask.deadlineTo"), {
				time: value?.deadline,
			})
		} else if (type === RepeatTypeMap.WEEKDAY_REPEAT) {
			deadline = t("chat.timedTask.weekdayRepeat2")
		}

		let per = REPEAT_TYPE_DESC[type]
		let timeStr = time

		switch (type) {
			case RepeatTypeMap.NO_REPEAT:
				return resolveToString(t("chat.timedTask.taskDescription2"), {
					day,
					time,
					deadline: t("chat.timedTask.noRepeat"),
				})
			case RepeatTypeMap.DAILY_REPEAT:
				break
			case RepeatTypeMap.WEEKLY_REPEAT:
				timeStr = `${t(
					`common:format.weekDay.${Number(day) === 0 ? 7 : Number(day)}`,
				)} ${time}`
				break
			case RepeatTypeMap.MONTHLY_REPEAT:
				timeStr = `${day}${t("calendar.newEvent.repeatOptions.sunday")} ${time}`
				break
			case RepeatTypeMap.WEEKDAY_REPEAT:
				per = REPEAT_TYPE_DESC[RepeatTypeMap.DAILY_REPEAT]
				break
			default:
				const unit = [Units.MONTH].includes(value?.unit) ? t("chat.timedTask.unit") : ""
				per = `${REPEAT_TYPE_DESC[type]}${
					value?.interval > 1 ? `${value?.interval}${unit}` : ""
				}${UNITS_DESC[value?.unit]}`
				switch (value?.unit) {
					case Units.MONTH:
						let month: string[] = []
						if (value?.values.length) {
							const newValues = [...value.values].sort()
							month = newValues.map(
								(v) => `${v}${t("calendar.newEvent.repeatOptions.sunday")}`,
							)
						}
						timeStr = `${month.join("、")} ${time}`
						break
					case Units.WEEK:
						let weeks: string[] = []
						if (value?.values.length) {
							const newValues = [...value.values].sort()
							weeks = newValues.map((v) => {
								return t(`common:format.weekDay.${Number(v) === 0 ? 7 : Number(v)}`)
							})
						}
						timeStr = `${weeks.join("、")} ${time}`
						break
					case Units.YEAR:
						const dayStr = value?.values
							.map((v) => `${v}${t("calendar.newEvent.repeatOptions.sunday")}`)
							.join("、")
						timeStr = `${day.split("-")[1]}${t(
							"calendar.newEvent.repeatOptions.month",
						)}${dayStr} ${time}`
						break
					default:
						break
				}
				break
		}
		if (timeStr) {
			return resolveToString(t("chat.timedTask.taskDescription"), {
				per,
				time: timeStr,
				deadline,
			})
		}
		return `${per} ${deadline}`
	}, [data, t])

	const topicName = useTopicName(conversationId, data.topic_id)

	return (
		<Flex className={styles.taskItem} gap={8} justify="space-between">
			<IconClockPlay className={styles.icon} size={20} />
			<Flex vertical style={{ flex: 1 }}>
				<div className={cx(styles.subTitle, styles.ellipsis)}>{data.name}</div>
				<div className={cx(styles.desc, styles.ellipsis)}>{taskDesc}</div>
				<Flex gap={4} align="center">
					<MagicIcon component={IconMessageTopic} size={16} />
					<span className={styles.desc}>{topicName || t("chat.topic.newTopic")}</span>
				</Flex>
			</Flex>
			<OperateMenu menuItems={menuItems(data)} useIcon className={styles.dots} />
		</Flex>
	)
})

const TaskItemWithMenu = memo((props: TaskItemProps) => {
	const { data, menuItems } = props

	return (
		<OperateMenu
			trigger="contextMenu"
			placement="right"
			menuItems={menuItems(data)}
			key={data.id}
		>
			<TaskItem {...props} />
		</OperateMenu>
	)
})

export default TaskItemWithMenu
