import MagicSpin from "@/opensource/components/base/MagicSpin"
import { Avatar, Flex, Input, List } from "antd"
import { useEffect, useState } from "react"
import { FlowRouteType } from "@/types/flow"
import { useLocation, useParams } from "react-router"
import FlowEmptyImage from "@/assets/logos/empty-flow.png"
import ToolsEmptyImage from "@/assets/logos/empty-tools.svg"
import { IconSearch } from "@tabler/icons-react"
import MagicButton from "@/opensource/components/base/MagicButton"
import InfiniteScroll from "react-infinite-scroll-component"
import type { MagicFlow } from "@dtyq/magic-flow/MagicFlow/types/flow"
import { useTranslation } from "react-i18next"
import { resolveToString } from "@dtyq/es6-template-strings"
import AddOrUpdateFlow from "./components/AddOrUpdateFlow"
import useFlowList from "./hooks/useFlowList"
import FlowCard from "../components/FlowCard"
import RightDrawer from "./components/RightDrawer"
import { useStyles } from "./styles"

function FlowListPage() {
	const { t: globalT } = useTranslation()
	const { t } = useTranslation("interface")
	const { type } = useParams()

	const location = useLocation()

	const { styles, cx } = useStyles()

	const [flowType, setFlowType] = useState(FlowRouteType.Sub)

	const {
		scrollRef,
		goToFlow,
		updateFlowEnable,
		getDropdownItems,
		getRightPanelDropdownItems,
		keyword,
		setKeyword,
		loading,
		flowList,
		title,
		toolSetId,
		setToolSetId,
		currentFlow,
		currentTool,
		updateFlowOrTool,
		expandPanelOpen,
		addOrUpdateFlowOpen,
		openAddOrUpdateFlow,
		handleCardClick,
		handleCloseAddOrUpdateFlow,
		handleCardCancel,
		addNewFlow,
		mutate,
		loadMoreData,
		hasMore,
		total,
	} = useFlowList({
		flowType,
	})

	useEffect(() => {
		setFlowType(type as FlowRouteType)
		mutate()
	}, [location.search, mutate, type])

	return (
		<Flex className={styles.container}>
			<Flex vertical flex={1}>
				<Flex align="center" justify="space-between" className={styles.top}>
					<div className={styles.leftTitle}>{`${title}（${total}）`}</div>
					<Flex align="center" gap={6}>
						<Input
							prefix={<IconSearch size={20} color="#b0b0b2" />}
							value={keyword}
							onChange={(e) => setKeyword(e.target.value)}
							placeholder={globalT("common.search", { ns: "flow" })}
						/>
						<MagicButton
							style={{ borderRadius: 8 }}
							type="primary"
							onClick={() => {
								handleCardCancel()
								openAddOrUpdateFlow()
							}}
						>
							{t("button.create")}
							{title}
						</MagicButton>
					</Flex>
				</Flex>
				<MagicSpin section spinning={loading}>
					<div
						id="scrollableDiv"
						ref={scrollRef}
						className={cx(styles.wrapper, {
							[styles.isEmptyList]: flowList.length === 0,
						})}
					>
						{!loading && flowList.length === 0 && (
							<Flex vertical gap={20} align="center">
								<Flex
									className={styles.flowEmptyImage}
									align="center"
									justify="center"
								>
									<Avatar
										src={
											flowType === FlowRouteType.Tools
												? ToolsEmptyImage
												: FlowEmptyImage
										}
										size={140}
									/>
								</Flex>
								<div className={styles.emptyTips}>
									{flowList.length === 0
										? resolveToString(t("common.neverCreate", { ns: "flow" }), {
												name: title,
											})
										: resolveToString(t("common.queryNone", { ns: "flow" }), {
												name: title,
											})}
								</div>

								{flowList.length === 0 && (
									<MagicButton type="primary" onClick={openAddOrUpdateFlow}>
										{t("button.create")}
										{title}
									</MagicButton>
								)}
							</Flex>
						)}
						{flowList.length !== 0 && (
							<InfiniteScroll
								dataLength={flowList.length}
								next={loadMoreData}
								hasMore={hasMore}
								loader={
									<Flex
										align="center"
										justify="center"
										className={styles.emptyTips}
									>
										………………
									</Flex>
								}
								endMessage={
									<Flex
										align="center"
										justify="center"
										className={styles.emptyTips}
									>
										————————{t("common.comeToTheEnd", { ns: "flow" })}————————
									</Flex>
								}
								className={styles.scrollWrapper}
								scrollableTarget="scrollableDiv"
							>
								<List
									grid={{ gutter: 8, sm: 2, md: 2, lg: 2, xl: 2, xxl: 2 }}
									dataSource={flowList}
									loading={loading}
									renderItem={(item: MagicFlow.Flow) => {
										const dropdownItems = getDropdownItems(item)
										return (
											<List.Item className={styles.listItem}>
												<FlowCard
													flowType={flowType}
													selected={currentFlow?.id === item.id}
													data={item}
													lineCount={1}
													dropdownItems={dropdownItems}
													onCardClick={handleCardClick}
													updateEnable={updateFlowEnable}
												/>
											</List.Item>
										)
									}}
								/>
							</InfiniteScroll>
						)}
					</div>
				</MagicSpin>
			</Flex>
			<RightDrawer
				open={expandPanelOpen}
				openAddOrUpdateFlow={openAddOrUpdateFlow}
				onClose={handleCardCancel}
				data={currentFlow}
				goToFlow={goToFlow}
				flowType={flowType}
				setToolSetId={setToolSetId}
				getDropdownItems={getRightPanelDropdownItems}
			/>
			<AddOrUpdateFlow
				flow={currentFlow}
				tool={currentTool}
				toolSetId={toolSetId}
				open={addOrUpdateFlowOpen}
				onClose={handleCloseAddOrUpdateFlow}
				updateFlowOrTool={updateFlowOrTool}
				addNewFlow={addNewFlow}
				flowType={flowType}
				title={title}
			/>
		</Flex>
	)
}

export default FlowListPage
