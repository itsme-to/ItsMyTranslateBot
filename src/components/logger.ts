import chalk from "chalk";
import { stdout } from "process";

export class Logger {
  private prefix: string = "ItsMyJarvis";

  private getCurrentTimestamp() {
    return new Date().toLocaleTimeString();
  }

  public warn(...text: any[]) {
    const timestamp = this.getCurrentTimestamp();
    const message = `[${timestamp}] ${chalk.bold(chalk.hex("#FADD05")("[WARN]"))}: [${this.prefix}] ${text.join('\n')}`;

    stdout.write(message + '\n');
  }

  public error(...text: any[]) {
    const timestamp = this.getCurrentTimestamp();
    const message = `[${timestamp}] ${chalk.bold(chalk.hex("#FF380B")("[ERROR]"))}: [${this.prefix}] ${text.join('\n')}`;

    stdout.write(message + '\n');
  }

  public empty(...text: any[]) {
    const message = text.join(' ');

    stdout.write(message + '\n');
  }

  public info(...text: any[]) {
    const timestamp = this.getCurrentTimestamp();
    const message = `[${timestamp}] ${chalk.bold(chalk.hex("#61FF73")("[INFO]"))}: [${this.prefix}] ${text.join('\n')}`;

    stdout.write(message + '\n');
  }

  public debug(...text: any[]) {
    const timestamp = this.getCurrentTimestamp();
    const message = `[${timestamp}] ${chalk.bold(chalk.hex("#17D5F7")("[DEBUG]"))}: [${this.prefix}] ${text.join('\n')}`;

    stdout.write(message + '\n');
  }
}