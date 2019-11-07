module.exports = {
	up: (queryInterface, Sequelize) =>
	queryInterface.createTable('admin_auths', {
		admin_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		admin_token: {
			type: Sequelize.STRING,
			allowNull: true
		},
		admin_name: {
			allowNull: false,
			type: Sequelize.STRING
		},
		password: {
			allowNull: false,
			type: Sequelize.STRING
		},
		createdAt: {
			allowNull: false,
			type: Sequelize.DATE
		},
		updatedAt: {
			allowNull: false,
			type: Sequelize.DATE
		}
	}),

	down: (queryInterface /* , Sequelize */) => queryInterface.dropTable('admin_auths'),
};