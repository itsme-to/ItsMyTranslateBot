import { userMention } from 'discord.js';
import { DataTypes, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import { Table, Model, Column } from 'sequelize-typescript';

@Table
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  @Column({
    type: DataTypes.STRING,
    primaryKey: true
  })
  declare id: string;

  @Column({
    type: DataTypes.STRING
  })
  declare username: string;

  @Column({
    type: DataTypes.STRING
  })
  declare displayName: string;

  @Column({
    type: DataTypes.STRING
  })
  declare avatar: string;

  @Column({
    type: DataTypes.INTEGER
  })
  declare createdAt: number;

  @Column({
    type: DataTypes.INTEGER,
    defaultValue: 0
  })
  declare credits: CreationOptional<number>;

  get mention(): NonAttribute<string> {
    return userMention(this.id);
  }

  async addCredits(amount: number) {
    this.credits += amount;
    await this.save();
  }

  async removeCredits(amount: number) {
    if (this.credits >= amount) {
      this.credits -= amount;
      await this.save();
    } else {
      throw new Error("Insufficient credits");
    }
  }

  async setCredits(amount: number) {
    this.credits = amount;
    await this.save();
  }

  hasCredits(amount: number) {
    return this.credits >= amount;
  }
}