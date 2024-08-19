import { App, LogLevel, SocketModeReceiver } from "@slack/bolt";
import {
	InputUserAndRegexpModal,
	InvitationCompletedModal,
	InvitationPreviewModal,
} from "./modtal";

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	appToken: process.env.SLACK_APP_TOKEN,
	socketMode: true,
	logLevel: LogLevel.INFO,
});

(async () => {
	await app.start();
	console.log("⚡️ Bolt app started");
})();

// スラッシュコマンドのリスナー
app.command("/regexpinvite", async ({ ack, body, client }) => {
	await ack();

	// モーダルを表示
	await client.views.open({
		trigger_id: body.trigger_id,
		view: InputUserAndRegexpModal("regexp_invite_modal"),
	});
});

type PrivateMeta = {
	users: string[];
	channels: string[];
};

// モーダルの送信イベントのリスナー
app.view(
	{ callback_id: "regexp_invite_modal", type: "view_submission" },
	async ({ ack, body, view, client }) => {
		const users =
			view.state.values.users_input?.users_input_action?.selected_users || [];
		const regexp_str =
			view.state.values.regexp_input?.regexp_input_action?.value;
		const regexp = new RegExp(regexp_str ?? "");

		// チャンネルリストを取得
		const result = await client.conversations.list();
		const channels =
			result.channels
				?.filter((channel) => regexp.test(channel.name ?? ""))
				.map((c) => c.id)
				.filter((c) => c !== undefined) || [];

		if (channels.length === 0) {
			await ack({
				response_action: "push",
				view: {
					type: "modal",
					title: {
						type: "plain_text",
						text: "No channel found",
					},
					blocks: [
						{
							type: "section",
							text: {
								type: "mrkdwn",
								text: "No channel found with the regular expression",
							},
						},
					],
					close: {
						type: "plain_text",
						text: "Close",
					},
				},
			});
			return;
		}

		const metadata: PrivateMeta = { users, channels };

		// 確認モーダルを表示
		await ack({
			response_action: "push",
			view: InvitationPreviewModal(
				users,
				channels,
				"confirm_invite_modal",
				metadata,
			),
		});
	},
);

// 確認モーダルの送信イベントのリスナー
app.view(
	{
		callback_id: "confirm_invite_modal",
		type: "view_submission",
	},
	async ({ ack, body, view, client }) => {
		const user = view.state.values.user_input?.user?.value ?? "";
		const regexp = new RegExp(
			view.state.values.regexp_input?.regexp?.value ?? "",
		);
		const metadata = JSON.parse(body.view.private_metadata) as PrivateMeta;

		// // チャンネルリストを取得
		// const result = await client.conversations.list();
		// const channels =
		// 	result.channels?.filter((channel) => regexp.test(channel.name ?? "")) || [];

		// // ユーザーをチャンネルに追加
		// for (const channel of channels) {
		// 	await client.conversations.invite({
		// 		channel: channel.id ?? "",
		// 		users: user ?? "",
		// 	});
		// }

		// 完了メッセージを送信
		// ackでメッセージを送信
		await ack({
			response_action: "update",
			view: InvitationCompletedModal(metadata.users, metadata.channels),
		});
	},
);
