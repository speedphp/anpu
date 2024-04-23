import { component, log, autoware, Redis } from "typespeed";
import { Player } from "../common/event-types";

@component
export default class RoomService {

  @autoware
  private redisObj: Redis;

  static USER_TO_ROOM_ID = "room:user:";
  static ROOM_WAITING = "room:waiting:";
  static ROOM_PLAYERS = "room:player:";

  // 获取我所在的房间
  public async findMyRoomId(uid: number): Promise<string> {
    return await this.redisObj.get(RoomService.USER_TO_ROOM_ID + uid);
  }

  // 取得房间内所有的玩家
  public async getRoomPlayers(roomId: string): Promise<Player[]> {
    const playerStrings = await this.redisObj.smembers(RoomService.ROOM_PLAYERS + roomId);
    return playerStrings.map(playerString => JSON.parse(playerString));
  }

  // 加入一个等待中房间，如果就近一个等待房间已经满员，那么开启下一个等待房间并加入
  // 返回当前房间的id
  public async getWaitingRoomAndJoin(player: Player): Promise<string> {
    let waitingRoomId = await this.redisObj.get(RoomService.ROOM_WAITING);
    if (!waitingRoomId ||
      (waitingRoomId && await this.getPlayerCount(waitingRoomId) >= 4)) {
      waitingRoomId = await this.createRoomAndJoin(player);
      await this.redisObj.set(RoomService.ROOM_WAITING, waitingRoomId);
    } else {
      await this.redisObj.sadd(RoomService.ROOM_PLAYERS + waitingRoomId, JSON.stringify(player));
    }
    await this.redisObj.set(RoomService.USER_TO_ROOM_ID + player.uid, waitingRoomId);
    return waitingRoomId;
  }

  // TODO 玩家离开后，托管到结束，然后销毁房间
  public endRoom(roomId: string) {
    
  }

  // 创建一个等待房间，并加入
  private async createRoomAndJoin(player: Player): Promise<string> {
    const playerInfo = JSON.stringify(player);
    const roomId = this.generateRandomString(10);
    await this.redisObj.sadd(RoomService.ROOM_PLAYERS + roomId, playerInfo);
    return roomId;
  }

  // 房间有几个玩家在等？
  private async getPlayerCount(roomId: string): Promise<number> {
    return await this.redisObj.scard(RoomService.ROOM_PLAYERS + roomId);
  }

  private generateRandomString(length: number): string {
    // 定义可能的字符集合
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    // 生成随机字符串
    for (let i = 0; i < length; i++) {
      // chars.length给出字符集合的长度，Math.random()生成0到1之间的随机数，乘以长度并取整得到索引
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}