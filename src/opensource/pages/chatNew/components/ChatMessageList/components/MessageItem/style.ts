import { createStyles, cx } from "antd-style"

import { calculateRelativeSize } from "@/utils/styles"

const useStyles = createStyles(
	(
		{ css, isDarkMode, prefixCls, token },
		{
			fontSize,
			isMultipleCheckedMode,
		}: {
			fontSize: number
			isMultipleCheckedMode: boolean
		},
	) => {
		const message = cx(css`
			width: 100%;
			border-radius: 12px;
			overflow-anchor: none;
			user-select: none;
			align-items: flex-end;
		`)

		return {
			flexContainer: css`
				display: flex;
			`,
			container: css`
				margin-top: ${calculateRelativeSize(12, fontSize)}px;
				flex-direction: row;
				// flex-direction: row-reverse;
				align-self: flex-end;
				padding: 0 14px;
				user-select: none;
				width: 100%;
				gap: 8px;

				> .${message} {
					align-items: flex-end;
				}

				${isMultipleCheckedMode
					? css`
							padding: 10px;
							border-radius: 12px;
							cursor: pointer;
							width: 100%;
							&:hover {
								background: ${isDarkMode
									? token.magicColorScales.grey[8]
									: token.magicColorUsages.primaryLight.default};
							}
					  `
					: ""}
			`,
			blockContainer: css`
				width: 100%;
				.${prefixCls}-dropdown-trigger {
					width: 100%;
					& > div {
						width: 100%;
					}
				}
			`,
		}
	},
)

export default useStyles
