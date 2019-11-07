module.exports = (sequelize, DataTypes) => {
  const admin_auth = sequelize.define('admin_auth', {
  		admin_id: {
  			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true
		},
		admin_token: {
			type: DataTypes.STRING,
			allowNull: true
		},
		admin_name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false
		}
	});

	admin_auth.associate = (models) => {
			// associations can be defined here
	};

  	return admin_auth;

};