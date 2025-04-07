import { Flex } from "antd"
import VolcengineImage from "@/assets/logos/volcengine.svg"
import MidjourneyImage from "@/assets/logos/midjourney.svg"
import FluxImage from "@/assets/logos/flux.svg"
import { cx } from "antd-style"
import { generateSnowFlake } from "@/opensource/pages/flow/utils/helpers"
import styles from "./Text2Image.module.less"

export enum ImageModel {
	// MJ 模型
	Midjourney = "Midjourney",
	// MJ Fast 模型
	MidjourneyFast = "Midjourney-Fast",
	// MJ Relax 模型
	MidjourneyRelax = "Midjourney-Relax",
	// MJ Turbo 模型
	MidjourneyTurbo = "Midjourney-Turbo",
	// Flux1 Dev模型
	Flux1Dev = "Flux1-Dev",
	// Flux1 Schnell 模型
	Flux1Schnell = "Flux1-Schnell",
	// Flux1 Pro 模型
	Flux1Pro = "Flux1-Pro",
	// 火山
	Volcengine = "Volcengine",
}

export const ImageModelOptions = [
	{
		label: (
			<Flex align="center" className={styles.optionLabel} gap={6}>
				<img src={MidjourneyImage} alt="" className={cx(styles.icon, styles.midjourney)} />
				<span>Midjourney</span>
			</Flex>
		),
		value: ImageModel.Midjourney,
	},
	{
		label: (
			<Flex align="center" className={styles.optionLabel} gap={6}>
				<img src={MidjourneyImage} alt="" className={cx(styles.icon, styles.midjourney)} />
				<span>Midjourney-Fast</span>
			</Flex>
		),
		value: ImageModel.MidjourneyFast,
	},
	{
		label: (
			<Flex align="center" className={styles.optionLabel} gap={6}>
				<img src={MidjourneyImage} alt="" className={cx(styles.icon, styles.midjourney)} />
				<span>Midjourney-Relax</span>
			</Flex>
		),
		value: ImageModel.MidjourneyRelax,
	},

	{
		label: (
			<Flex align="center" className={styles.optionLabel} gap={6}>
				<img src={FluxImage} alt="" className={cx(styles.icon, styles.midjourney)} />
				<span>{ImageModel.Flux1Dev}</span>
			</Flex>
		),
		value: ImageModel.Flux1Dev,
	},
	{
		label: (
			<Flex align="center" className={styles.optionLabel} gap={6}>
				<img src={FluxImage} alt="" className={cx(styles.icon, styles.midjourney)} />
				<span>{ImageModel.Flux1Pro}</span>
			</Flex>
		),
		value: ImageModel.Flux1Pro,
	},
	{
		label: (
			<Flex align="center" className={styles.optionLabel} gap={6}>
				<img src={FluxImage} alt="" className={cx(styles.icon, styles.midjourney)} />
				<span>{ImageModel.Flux1Schnell}</span>
			</Flex>
		),
		value: ImageModel.Flux1Schnell,
	},
	{
		label: (
			<Flex align="center" className={styles.optionLabel} gap={6}>
				<img src={VolcengineImage} alt="" className={cx(styles.icon, styles.volcengin)} />
				<span>Volcengine</span>
			</Flex>
		),
		value: ImageModel.Volcengine,
	},
]

// mj模式下的可选项
export const mjRatioOptions = [
	{
		label: "1:1",
		id: "1:1",
	},
	{
		label: "2:3",
		id: "2:3",
	},
	{
		label: "3:4",
		id: "3:4",
	},
	{
		label: "9:16",
		id: "9:16",
	},
	{
		label: "3:2",
		id: "3:2",
	},
	{
		label: "4:3",
		id: "4:3",
	},

	{
		label: "16:9",
		id: "16:9",
	},
]

// 火山模式下的可选项
export const voRatioOptions = [
	{
		label: "1:1",
		id: "1:1",
		suffixText: "512*512",
	},
	{
		label: "2:3",
		id: "2:3",
		suffixText: "341*512",
	},
	{
		label: "3:4",
		id: "3:4",
		suffixText: "384*512",
	},
	{
		label: "9:16",
		id: "9:16",
		suffixText: "288*512",
	},
	{
		label: "3:2",
		id: "3:2",
		suffixText: "512*341",
	},
	{
		label: "4:3",
		id: "4:3",
		suffixText: "512*384",
	},

	{
		label: "16:9",
		id: "16:9",
		suffixText: "512*288",
	},

	{
		label: "自定义",
		id: "custom",
		suffixText: "宽高最大512",
	},
]

export const ratioToSize: Record<
	string,
	{
		width: number
		height: number
	}
> = {
	"1:1": {
		width: 512,
		height: 512,
	},
	"2:3": {
		width: 341,
		height: 512,
	},
	"3:4": {
		width: 384,
		height: 512,
	},
	"9:16": {
		width: 288,
		height: 512,
	},
	"3:2": {
		width: 512,
		height: 341,
	},
	"4:3": {
		width: 512,
		height: 384,
	},
	"16:9": {
		width: 512,
		height: 288,
	},
}

export const getDefaultSelfDefineRatio = () => {
	return {
		id: "component-674ebb9acded1",
		version: "1",
		type: "value",
		structure: {
			type: "const",
			const_value: [
				{
					type: "names",
					uniqueId: "658155687259410432",
					names_value: [
						{
							id: "custom",
							name: "自定义",
						},
					],
					value: "",
				},
			],
			expression_value: [],
		},
	}
}

export const getDefaultSize = (value: string) => {
	return {
		id: "component-674ebb9acded1",
		version: "1",
		type: "value",
		structure: {
			type: "expression",
			const_value: [],
			expression_value: [
				{
					type: "input",
					uniqueId: generateSnowFlake(),
					value,
				},
			],
		},
	}
}
