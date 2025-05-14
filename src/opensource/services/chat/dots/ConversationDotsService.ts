/* eslint-disable class-methods-use-this */
import conversationStore from "@/opensource/stores/chatNew/conversation"
import ConversationDbServices from "@/opensource/services/chat/conversation/ConversationDbService"
import MessageStore from "@/opensource/stores/chatNew/message"
import { toJS } from "mobx"
import { count } from "console"

/**
 * 会话红点服务
 */
class ConversationDotsService {
	get currentConversationId() {
		return MessageStore.conversationId
	}

	get currentTopicId() {
		return MessageStore.topicId
	}

	/**
	 * 增加未读消息数量(会话ID和话题ID)
	 *
	 * @param conversationId 会话ID
	 * @param topicId 话题ID
	 * @param dots 增加的数量
	 */
	async addUnreadDots(conversationId: string, topicId: string, dots: number) {
		if (!conversationId) return

		if (this.currentConversationId !== conversationId || this.currentTopicId !== topicId) {
			const conversation = conversationStore.getConversation(conversationId)

			if (conversation) {
				conversationStore.addConversationDots(conversationId, dots)
				conversationStore.addTopicUnreadDots(conversationId, topicId, dots)

				setTimeout(() => {
					const count = conversationStore.getConversationDots(conversationId)
					console.log(
						"ConversationDotsService addUnreadDots",
						conversationId,
						topicId,
						dots,
						count,
					)

					// 更新数据库
					ConversationDbServices.updateUnreadDots(
						conversationId,
						count,
						Object.fromEntries(
							toJS(conversationStore.getAllTopicUnreadDots(conversationId)).entries(),
						),
					)
						.then(() => {
							console.log(
								"ConversationDotsService addUnreadDots updateUnreadDots success",
							)
						})
						.catch((error: any) => {
							console.error(
								"ConversationDotsService addUnreadDots updateUnreadDots error",
								error,
							)
						})
				}, 0)
			} else {
				ConversationDbServices.getConversation(conversationId).then((conversation) => {
					if (conversation) {
						const topicUnreadDots = conversation.topic_unread_dots

						topicUnreadDots.set(topicId, (topicUnreadDots.get(topicId) ?? 0) + dots)

						ConversationDbServices.updateUnreadDots(
							conversationId,
							conversation.unread_dots + dots,
							Object.fromEntries(topicUnreadDots.entries()),
						)
					}
				})
			}
		}
	}

	/**
	 * 减少话题未读数量
	 * @param conversationId 会话ID
	 * @param topicId 话题ID
	 * @param dots 减少的数量
	 */
	reduceUnreadDots(conversationId: string, topicId: string, dots: number) {
		if (!conversationId) return

		conversationStore.reduceTopicUnreadDots(conversationId, topicId, dots)
		conversationStore.reduceConversationDots(conversationId, dots)

		// 更新数据库
		ConversationDbServices.updateUnreadDots(
			conversationId,
			conversationStore.getConversationDots(conversationId),
			Object.fromEntries(
				toJS(conversationStore.getAllTopicUnreadDots(conversationId)).entries(),
			),
		)
	}

	/**
	 * 重置话题未读数量
	 * @param conversationId 会话ID
	 */
	resetUnreadDots(conversationId: string) {
		if (!conversationId) return

		conversationStore.resetTopicUnreadDots(conversationId)
		conversationStore.resetConversationDots(conversationId)

		// 更新数据库
		ConversationDbServices.updateConversation(conversationId, {
			unread_dots: conversationStore.getConversationDots(conversationId),
			topic_unread_dots: new Map(),
		})
	}
}

export default new ConversationDotsService()
