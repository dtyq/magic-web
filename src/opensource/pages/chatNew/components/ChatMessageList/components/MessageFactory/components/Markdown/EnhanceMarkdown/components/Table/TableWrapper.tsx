import React, {
	useState,
	useMemo,
	cloneElement,
	isValidElement,
	useRef,
	useEffect,
	useCallback,
} from "react"
import { Switch } from "antd"
import RowDetailDrawer from "./RowDetailDrawer"
import { useTableStyles } from "./styles"
import { useTableI18n } from "./useTableI18n"

// 表格列数限制配置
const DEFAULT_MAX_COLUMNS = 5 // 默认最大列数

// 提取表格数据的工具函数
const extractTableData = (children: React.ReactNode, i18n: ReturnType<typeof useTableI18n>) => {
	const rows: React.ReactNode[][] = []
	let headers: string[] = []

	const processChildren = (child: React.ReactNode) => {
		if (!isValidElement(child)) return

		// 处理React Fragment
		if (child.type === React.Fragment || typeof child.type === "symbol") {
			React.Children.forEach(child.props.children, processChildren)
			return
		}

		if (child.type === "thead") {
			// 处理表头
			const headRows = React.Children.toArray(child.props.children)
			headRows.forEach((headRow) => {
				if (isValidElement(headRow) && headRow.type === "tr") {
					const cells = React.Children.toArray(headRow.props.children)
					headers = cells.map((cell, index) => {
						if (isValidElement(cell)) {
							const cellContent = cell.props.children
							return typeof cellContent === "string"
								? cellContent
								: `${i18n.defaultColumn} ${index + 1}`
						}
						return `${i18n.defaultColumn} ${index + 1}`
					})
				}
			})
		} else if (child.type === "tbody") {
			// 处理表体
			const bodyRows = React.Children.toArray(child.props.children)
			bodyRows.forEach((bodyRow) => {
				if (isValidElement(bodyRow) && bodyRow.type === "tr") {
					const cells = React.Children.toArray(bodyRow.props.children)
					const rowData = cells.map((cell) => {
						if (isValidElement(cell)) {
							return cell.props.children
						}
						return ""
					})
					rows.push(rowData)
				}
			})
		}
	}

	React.Children.forEach(children, processChildren)
	return { headers, rows }
}

// 自定义Hook：动态计算可见列数
const useDynamicColumnCount = (
	headers: string[],
	containerRef: React.RefObject<HTMLDivElement>,
) => {
	const [maxVisibleColumns, setMaxVisibleColumns] = useState(DEFAULT_MAX_COLUMNS)

	const calculateMaxColumns = useCallback(() => {
		if (!containerRef.current || headers.length === 0) {
			return DEFAULT_MAX_COLUMNS
		}

		const containerWidth = containerRef.current.offsetWidth
		if (containerWidth === 0) {
			return DEFAULT_MAX_COLUMNS
		}

		// 如果列数较少，直接显示所有列
		if (headers.length <= DEFAULT_MAX_COLUMNS) {
			return headers.length
		}

		// 确保不少于最小列数，但要为"更多"列留出至少1列的空间
		const finalMaxColumns = DEFAULT_MAX_COLUMNS

		return finalMaxColumns
	}, [headers.length, containerRef])

	useEffect(() => {
		const updateColumnCount = () => {
			const newMaxColumns = calculateMaxColumns()
			setMaxVisibleColumns(newMaxColumns)
		}

		// 初始计算
		updateColumnCount()

		// 监听容器大小变化
		const resizeObserver = new ResizeObserver(() => {
			updateColumnCount()
		})

		if (containerRef.current) {
			resizeObserver.observe(containerRef.current)
		}

		// 监听窗口大小变化（作为备用）
		const handleResize = () => {
			setTimeout(updateColumnCount, 100) // 延迟执行，确保DOM更新完成
		}

		window.addEventListener("resize", handleResize)

		return () => {
			resizeObserver.disconnect()
			window.removeEventListener("resize", handleResize)
		}
	}, [calculateMaxColumns])

	return maxVisibleColumns
}

// 修改表格以添加"显示更多"列
const enhanceTableWithMoreColumn = (
	children: React.ReactNode,
	onShowMore: (rowIndex: number) => void,
	showMoreButtonClass: string,
	showMoreText: string,
	maxVisibleColumns: number,
	showAllColumns: boolean,
	onToggleShowAll: (checked: boolean) => void,
	showAllColumnsText: string,
	hideAllColumnsText: string,
	moreColumnHeaderClass: string,
): React.ReactNode => {
	return React.Children.map(children, (child) => {
		if (!isValidElement(child)) return child

		// 处理React Fragment
		if (child.type === React.Fragment || typeof child.type === "symbol") {
			return cloneElement(
				child,
				{},
				enhanceTableWithMoreColumn(
					child.props.children,
					onShowMore,
					showMoreButtonClass,
					showMoreText,
					maxVisibleColumns,
					showAllColumns,
					onToggleShowAll,
					showAllColumnsText,
					hideAllColumnsText,
					moreColumnHeaderClass,
				),
			)
		}

		if (child.type === "thead") {
			// 修改表头，添加"显示更多"列
			const headRows = React.Children.map(child.props.children, (headRow) => {
				if (!isValidElement(headRow) || headRow.type !== "tr") return headRow

				const cells = React.Children.toArray((headRow as any).props.children)

				// 当显示所有列时，显示所有原始列
				const visibleCells = showAllColumns ? cells : cells.slice(0, maxVisibleColumns)

				if (cells.length > maxVisibleColumns) {
					const moreHeaderCell = (
						<th key="more-header" style={{ textAlign: "center" }}>
							<div className={moreColumnHeaderClass}>
								<div className="switch-container">
									<Switch
										checkedChildren={hideAllColumnsText}
										unCheckedChildren={showAllColumnsText}
										checked={showAllColumns}
										onChange={onToggleShowAll}
									/>
								</div>
							</div>
						</th>
					)
					return cloneElement(headRow, {}, [...visibleCells, moreHeaderCell])
				}

				return headRow
			})

			return cloneElement(child, {}, headRows)
		}

		if (child.type === "tbody") {
			// 修改表体，添加"显示更多"按钮
			const bodyRows = React.Children.map(child.props.children, (bodyRow, rowIndex) => {
				if (!isValidElement(bodyRow) || bodyRow.type !== "tr") return bodyRow

				const cells = React.Children.toArray((bodyRow as any).props.children)

				// 当显示所有列时，显示所有原始列
				const visibleCells = showAllColumns ? cells : cells.slice(0, maxVisibleColumns)

				if (cells.length > maxVisibleColumns) {
					const moreButtonCell = (
						<td key="more-button" style={{ textAlign: "center" }}>
							<button
								className={showMoreButtonClass}
								onClick={() => onShowMore(rowIndex)}
								type="button"
							>
								{showMoreText}
							</button>
						</td>
					)
					return cloneElement(bodyRow, {}, [...visibleCells, moreButtonCell])
				}

				return bodyRow
			})

			return cloneElement(child, {}, bodyRows)
		}

		return child
	})
}

// 自定义表格组件，添加水平滚动容器和动态列数限制功能
const TableWrapper = ({ node, ...props }: any) => {
	const i18n = useTableI18n()
	const { styles, cx } = useTableStyles()
	const [drawerVisible, setDrawerVisible] = useState(false)
	const [currentRowData, setCurrentRowData] = useState<Record<string, React.ReactNode>>({})
	const [showAllColumns, setShowAllColumns] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	const { headers, rows } = useMemo(
		() => extractTableData(props.children, i18n),
		[props.children, i18n],
	)

	// 使用动态列数计算Hook
	const maxVisibleColumns = useDynamicColumnCount(headers, containerRef)

	// 检查是否需要显示"更多"列（当总列数超过最大可见列数时就需要）
	const needsMoreColumn = headers.length > maxVisibleColumns

	const handleShowMore = (rowIndex: number) => {
		if (rows[rowIndex]) {
			const rowData: Record<string, React.ReactNode> = {}
			headers.forEach((header, index) => {
				rowData[header] = rows[rowIndex][index] || ""
				rowData[index] = rows[rowIndex][index] || ""
			})
			setCurrentRowData(rowData)
			setDrawerVisible(true)
		}
	}

	const handleCloseDrawer = () => {
		setDrawerVisible(false)
		setCurrentRowData({})
	}

	const enhancedChildren = needsMoreColumn
		? enhanceTableWithMoreColumn(
				props.children,
				handleShowMore,
				styles.showMoreButton,
				i18n.showMore,
				maxVisibleColumns,
				showAllColumns,
				setShowAllColumns,
				i18n.showAllColumns,
				i18n.hideAllColumns,
				styles.moreColumnHeader,
		  )
		: props.children

	return (
		<div ref={containerRef} className={cx(styles.tableContainer, styles.mobileTable)}>
			<table {...props}>{enhancedChildren}</table>

			<RowDetailDrawer
				visible={drawerVisible}
				onClose={handleCloseDrawer}
				rowData={currentRowData}
				headers={headers}
				title={i18n.rowDetails}
			/>
		</div>
	)
}

export default TableWrapper
