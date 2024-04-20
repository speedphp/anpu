import { KindCompare } from '../common/types';
import Card from "../entity/card.class";

export const testFour = (cards: Card[]): KindCompare[] => {
  const result:KindCompare[] = [];
  let groups: Map<number, Card[]> = new Map();
  for(let card of cards) {
    if (groups.has(card.point)) {
      groups.get(card.point)!.push(card);
    } else {
      groups.set(card.point, [card]);
    }
  }
  for(let [point, fourCards] of groups.entries()) {
    if (fourCards.length == 4) {
      result.push(...handleFour(fourCards, cards));
    }
  }
  return result;
}

// 四个一组进去，和整个数组进去，把余下的元素拼凑成很多组，并且都给比较值
function handleFour(fourCards: Card[], allCards: Card[]) : KindCompare[] {
  const compare = fourCards[fourCards.length - 1].num;
  const fourNums = fourCards.map(card => card.num);
  return allCards.filter(card => !fourNums.includes(card.num)).map(card => ({
    group: [...fourCards, card],
    compare: compare
  }));
}