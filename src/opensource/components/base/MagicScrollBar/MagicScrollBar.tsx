import { useRef, forwardRef } from "react"
import type { ReactNode, MutableRefObject, HTMLAttributes } from "react"
import SimpleBarCore from "simplebar-core"
import type { SimpleBarOptions } from "simplebar-core"
import { useDeepCompareEffect } from "ahooks"
import "./MagicScrollBar.css"
import { useStyles } from "@/opensource/components/base/MagicScrollBar/styles"

type RenderFunc = (props: {
	scrollableNodeRef: MutableRefObject<HTMLElement | undefined>
	scrollableNodeProps: {
		className: string
		ref: MutableRefObject<HTMLElement | undefined>
	}
	contentNodeRef: MutableRefObject<HTMLElement | undefined>
	contentNodeProps: {
		className: string
		ref: MutableRefObject<HTMLElement | undefined>
	}
}) => ReactNode

export interface MagicScrollBarProps
	extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
		SimpleBarOptions {
	children?: ReactNode | RenderFunc
	scrollableNodeProps?: {
		ref?: any
		className?: string
		[key: string]: any
	}
}

const MagicScrollBar = forwardRef<SimpleBarCore | null, MagicScrollBarProps>(
	({ children, scrollableNodeProps = {}, ...otherProps }, ref) => {
		const elRef = useRef()
		const scrollableNodeRef = useRef<HTMLElement>()
		const contentNodeRef = useRef<HTMLElement>()
		const options: Partial<SimpleBarOptions> = {}
		const rest: any = {}

		const { styles, cx } = useStyles()

		Object.keys(otherProps).forEach((key) => {
			if (Object.prototype.hasOwnProperty.call(SimpleBarCore.defaultOptions, key)) {
				;(options as any)[key] = otherProps[key as keyof SimpleBarOptions]
			} else {
				rest[key] = otherProps[key as keyof SimpleBarOptions]
			}
		})

		const classNames = {
			...SimpleBarCore.defaultOptions.classNames,
			...options.classNames,
		} as Required<(typeof SimpleBarCore.defaultOptions)["classNames"]>

		const scrollableNodeFullProps = {
			...scrollableNodeProps,
			className: `${classNames.contentWrapper}${
				scrollableNodeProps.className ? ` ${scrollableNodeProps.className}` : ""
			}`,
			tabIndex: options.tabIndex || SimpleBarCore.defaultOptions.tabIndex,
			role: "region",
			"aria-label": options.ariaLabel || SimpleBarCore.defaultOptions.ariaLabel,
		}

		useDeepCompareEffect(() => {
			let instance: SimpleBarCore | null
			scrollableNodeRef.current = scrollableNodeFullProps.ref
				? scrollableNodeFullProps.ref.current
				: scrollableNodeRef.current

			if (elRef.current) {
				instance = new SimpleBarCore(elRef.current, {
					...options,
					...(scrollableNodeRef.current && {
						scrollableNode: scrollableNodeRef.current,
					}),
					...(contentNodeRef.current && {
						contentNode: contentNodeRef.current,
					}),
				})

				if (typeof ref === "function") {
					ref(instance)
				} else if (ref) {
					;(ref as MutableRefObject<SimpleBarCore | null>).current = instance
				}
			}

			return () => {
				instance?.unMount()
				instance = null
				if (typeof ref === "function") {
					ref(null)
				}
			}
		}, [])

		return (
			<div data-simplebar="init" ref={elRef} {...rest}>
				<div className={classNames.wrapper}>
					<div className={classNames.heightAutoObserverWrapperEl}>
						<div className={classNames.heightAutoObserverEl} />
					</div>
					<div className={classNames.mask}>
						<div className={classNames.offset}>
							{typeof children === "function" ? (
								children({
									scrollableNodeRef,
									scrollableNodeProps: {
										...scrollableNodeFullProps,
										ref: scrollableNodeRef,
									},
									contentNodeRef,
									contentNodeProps: {
										className: classNames.contentEl,
										ref: contentNodeRef,
									},
								})
							) : (
								<div {...scrollableNodeFullProps}>
									<div className={classNames.contentEl} tabIndex={-1}>
										{children}
									</div>
								</div>
							)}
						</div>
					</div>
					<div className={classNames.placeholder} />
				</div>
				<div className={cx(classNames.track, "simplebar-horizontal")}>
					<div className={cx(classNames.scrollbar, styles.scrollBar)} />
				</div>
				<div className={cx(classNames.track, "simplebar-vertical")}>
					<div className={cx(classNames.scrollbar, styles.scrollBar)} />
				</div>
			</div>
		)
	},
)

export default MagicScrollBar
