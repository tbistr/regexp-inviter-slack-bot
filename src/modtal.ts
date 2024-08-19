import type { ModalView } from "@slack/types";

export const InputUserAndRegexpModal = (callback_id: string): ModalView => {
	return {
		callback_id: callback_id,
		type: "modal",
		title: {
			type: "plain_text",
			text: "Invite User to Channel",
		},
		blocks: [
			{
				type: "section",
				block_id: "users_input",
				text: {
					type: "mrkdwn",
					text: "Pick users from the list",
				},
				accessory: {
					action_id: "users_input_action",
					type: "multi_users_select",
					placeholder: {
						type: "plain_text",
						text: "Select users",
					},
				},
			},
			{
				type: "input",
				block_id: "regexp_input",
				element: {
					type: "plain_text_input",
					action_id: "regexp_input_action",
					placeholder: {
						type: "plain_text",
						text: "Enter a regular expression for channel names",
					},
				},
				label: {
					type: "plain_text",
					text: "Regular Expression",
				},
			},
		],
		submit: {
			type: "plain_text",
			text: "Submit",
		},
		close: {
			type: "plain_text",
			text: "Cancel",
		},
	};
};

const header = (text: string) => {
	return {
		type: "header",
		text: {
			type: "plain_text",
			text: text,
		},
	};
};

const bulletList = (items: string[], element_type: "user" | "channel") => {
	return {
		type: "rich_text",
		elements: [
			{
				type: "rich_text_list",
				style: "bullet",
				elements: items.map((item) => ({
					type: "rich_text_section",
					elements: [
						{
							type: element_type,
							[element_type === "user" ? "user_id" : "channel_id"]: item,
						},
					],
				})),
			},
		],
	};
};

export const InvitationPreviewModal = (
	users: string[],
	channels: string[],
	callback_id: string,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	metadata: any,
): ModalView => {
	return {
		type: "modal",
		callback_id: callback_id,
		title: {
			type: "plain_text",
			text: "Confirm Invitation",
		},
		blocks: [
			header("Users for Invitation"),
			bulletList(users, "user"),
			{
				type: "divider",
			},
			header("Channels for Invitation"),
			bulletList(channels, "channel"),
		],
		close: {
			type: "plain_text",
			text: "Cancel",
		},
		submit: {
			type: "plain_text",
			text: "OK",
		},
		private_metadata: JSON.stringify(metadata),
	};
};

export const InvitationCompletedModal = (
	users: string[],
	channels: string[],
): ModalView => {
	return {
		type: "modal",
		title: {
			type: "plain_text",
			text: "Invitation Completed",
		},
		blocks: [
			{
				type: "section",
				text: {
					type: "mrkdwn",
					text: `Invited ${users.map((user) => `<@${user}>`).join(", ")} to ${channels.map((channel) => `<#${channel}>`).join(", ")}`,
				},
			},
		],
		close: {
			type: "plain_text",
			text: "Close",
		},
	};
};
