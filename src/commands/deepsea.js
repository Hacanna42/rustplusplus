const Builder = require('@discordjs/builders');

const DiscordMessages = require('../discordTools/discordMessages.js');

module.exports = {
	name: 'deepsea',

	getData(client, guildId) {
		return new Builder.SlashCommandBuilder()
			.setName('deepsea')
			.setDescription(client.intlGet(guildId, 'commandsDeepseaDesc'))
			.addSubcommand(subcommand => subcommand
				.setName('status')
				.setDescription(client.intlGet(guildId, 'commandsDeepseaStatusDesc')))
			.addSubcommand(subcommand => subcommand
				.setName('calibrate')
				.setDescription(client.intlGet(guildId, 'commandsDeepseaCalibrateDesc'))
                .addStringOption(option => option.setName('time').setDescription(client.intlGet(guildId, 'commandsDeepseaCalibrateTimeDesc')).setRequired(true)));
	},

	async execute(client, interaction) {
		const rustplus = client.rustplusInstances[interaction.guildId];

		const verifyId = Math.floor(100000 + Math.random() * 900000);
		client.logInteraction(interaction, verifyId, 'slashCommand');

		if (!await client.validatePermissions(interaction)) return;
		await interaction.deferReply({ ephemeral: false });

		if (!rustplus || !rustplus.isOperational) {
			await interaction.editReply({ content: client.intlGet(interaction.guildId, 'notConnectedToRustServer') });
			return;
		}

		let string = '';
		switch (interaction.options.getSubcommand()) {
			case 'status': {
				const strings = rustplus.getCommandDeepsea();
				string = typeof strings === 'string' ? strings : strings.join('\n');
			} break;

			case 'calibrate': {
				const timeStr = interaction.options.getString('time');
				const success = rustplus.calibrateDeepsea(timeStr);
                if (success) {
                    string = client.intlGet(interaction.guildId, 'deepseaCalibrated');
                } else {
                    string = client.intlGet(interaction.guildId, 'deepseaCalibrateError');
                }
			} break;

			default: {
			} break;
		}

		client.log(client.intlGet(null, 'infoCap'), client.intlGet(null, 'slashCommandValueChange', {
			id: `${verifyId}`,
			value: `${interaction.options.getSubcommand()}`
		}));

		await interaction.editReply({ content: string });
		client.log(client.intlGet(null, 'infoCap'), client.intlGet(interaction.guildId, 'commandsDeepseaDesc'));
	},
};
