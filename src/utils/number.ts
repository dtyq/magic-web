/**
 * 将数值格式化为带千分位分隔符的字符串
 * @param number 数值
 * @returns 格式化后的数值
 */
export function splitNumber(
	number: number,
	delimiterPosition: number = 3,
	char: string = ",",
): string {
	// 将数值转换为字符串
	const numStr: string = number.toString()
	// 将小数点前的部分与小数点后的部分分离
	const parts: string[] = numStr.split(".")

	// 将整数部分添加千分位分隔符
	parts[0] = parts[0].replace(new RegExp(`\\B(?=(\\d{${delimiterPosition}})+(?!\\d))`, "g"), char)

	// 返回格式化后的数值
	return parts.join(".")
}
