# Table 组件测试运行指南

## 📋 测试命令

### 运行单个测试文件

```bash
# 测试国际化 Hook
npm test -- useTableI18n.test.tsx

# 测试表格单元格组件
npm test -- TableCell.test.tsx

# 测试行详细抽屉组件
npm test -- RowDetailDrawer.test.tsx

# 测试表格包装器组件
npm test -- TableWrapper.test.tsx

# 测试样式 Hook
npm test -- styles.test.tsx

# 测试集成测试
npm test -- index.test.tsx
```

### 运行所有 Table 组件测试

```bash
# 运行所有包含 "Table" 的测试
npm test -- Table

# 或者运行整个测试目录
npm test -- __tests__
```

### 生成覆盖率报告

```bash
# 生成测试覆盖率报告
npm test -- --coverage Table
```

### 监听模式运行测试

```bash
# 在监听模式下运行测试（开发时使用）
npm test -- --watch Table
```

## 🎯 测试验证检查清单

在提交代码前，请确保以下测试都通过：

- [ ] ✅ useTableI18n Hook 测试 (3个测试用例)
- [ ] ✅ TableCell 组件测试 (9个测试用例)
- [ ] ✅ RowDetailDrawer 组件测试 (9个测试用例)
- [ ] ✅ TableWrapper 组件测试 (13个测试用例)
- [ ] ✅ useTableStyles Hook 测试 (5个测试用例)
- [ ] ✅ 集成测试 (10个测试用例)

**总计：49个测试用例**

## 🐛 常见问题解决

### 1. 测试文件找不到
```bash
Error: No test suite found in file
```
**解决方案**: 确保测试文件包含有效的测试内容，检查文件是否为空。

### 2. Mock 依赖问题
```bash
TypeError: Cannot read property of undefined
```
**解决方案**: 检查 vi.mock() 的配置是否正确，确保所有外部依赖都被正确模拟。

### 3. 样式类找不到
```bash
Expected element to have class 'xxx' but it didn't
```
**解决方案**: 检查样式 Mock 配置，确保返回正确的类名。

### 4. TypeScript 类型错误
```bash
Type 'xxx' is not assignable to type 'yyy'
```
**解决方案**: 检查 TypeScript 配置和类型定义，确保测试代码类型正确。

## 🏃‍♂️ 快速开始

1. **运行基础测试**: `npm test -- useTableI18n.test.tsx`
2. **确认测试环境**: 检查是否有测试通过
3. **运行全部测试**: `npm test -- Table`
4. **查看覆盖率**: `npm test -- --coverage Table`

## 📈 性能指标

- **测试执行时间**: < 2秒
- **代码覆盖率目标**: > 90%
- **测试文件数量**: 6个
- **测试用例总数**: 49个

## 🔍 调试测试

如果测试失败，可以使用以下方法调试：

```bash
# 增加详细输出
npm test -- --reporter=verbose Table

# 只运行失败的测试
npm test -- --run --reporter=verbose Table

# 使用调试模式
npm test -- --inspect-brk Table
```

---

**注意**: 请确保在提交代码前运行完整的测试套件，保证所有功能正常工作。 