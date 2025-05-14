import {
	useGlobalLanguage,
	useSupportLanguageOptions,
} from "@/opensource/models/config/hooks"
import { Select } from "antd"
import { observer } from "mobx-react-lite"
import { configService } from "@/services"
import type { Variant } from "antd/es/config-provider"
import { useStyles } from "./styles"

interface LanguageSwitchProps {
	className?: string
	popupClassName?: string
	variant?: Variant;
}

const LanguageSwitch = observer((props: LanguageSwitchProps) => {
	const {className, popupClassName, variant} = props
	const {styles, cx} = useStyles()
	
	const lang = useGlobalLanguage()
	const languageSelected = useGlobalLanguage(false)
	const options = useSupportLanguageOptions()
	
	return (
		<Select
			value={ lang }
			className={ cx(styles.select, className) }
			options={ options }
			variant={ variant }
			placement="bottomRight"
			onChange={ (language: string) => configService.setLanguage(language) }
			popupClassName={ popupClassName }
			optionRender={ (option) => {
				const label = option.data.translations?.[option.data.value] ?? option.data.label
				const tip = option.data.translations?.[languageSelected] ?? option.data.value
				return (
					<div className={ styles.menuItem }>
						<div className={ styles.menuItemLeft }>
							<div className={ styles.menuItemTop }>
								<span className={ styles.menuItemTopName }>{ label }</span>
							</div>
							<div className={ styles.menuItemBottom }>{ tip }</div>
						</div>
					</div>
				)
			} }
		/>
	)
})

export default LanguageSwitch
