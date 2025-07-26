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
  declare tokens: CreationOptional<number>;

  get mention(): NonAttribute<string> {
    return userMention(this.id);
  }

  async addTokens(amount: number) {
    this.tokens += amount;
    await this.save();
  }

  async removeTokens(amount: number) {
    if (this.tokens >= amount) {
      this.tokens -= amount;
      await this.save();
    } else {
      throw new Error("Insufficient tokens");
    }
  }

  async setTokens(amount: number) {
    this.tokens = amount;
    await this.save();
  }

  hasTokens(amount: number) {
    return this.tokens >= amount;
  }
}