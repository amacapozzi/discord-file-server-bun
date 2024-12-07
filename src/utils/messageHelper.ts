export class MessageHelper {
  private readonly webhookUrl: string;
  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  public async getMessage(messageId: string) {
    const messageResponse = await fetch(
      `${this.webhookUrl}/message/${messageId}`
    );
    return messageResponse.json();
  }
  public async deleteMessage(messageId: string) {
    const deletedResponse = await fetch(
      `${this.webhookUrl}/message/${messageId}`,
      { method: "DELETE" }
    );
    return deletedResponse.json();
  }
}
