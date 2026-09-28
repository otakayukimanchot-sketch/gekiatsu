import React from 'react';
import { X, BookOpen, Shield, Sword, Sparkles, Layers, ArrowRight, Flame } from 'lucide-react';

interface RuleModalProps {
  onClose: () => void;
}

export const RuleModal: React.FC<RuleModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-stone-900 border-2 border-amber-600/80 shadow-2xl flex flex-col max-h-[90vh] text-stone-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>「本物カードバトル」正式ルールブック</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rules Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs leading-relaxed flex-1">
          {/* Section 1: Objective & HP */}
          <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700">
            <h3 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 text-sm">
              <Sword className="w-4 h-4" /> 勝利条件と基本システム
            </h3>
            <ul className="list-disc list-inside space-y-1 text-stone-300">
              <li>各プレイヤーは<strong className="text-rose-400 font-bold">HP 5000</strong>で対戦を開始します。</li>
              <li>相手のHPを0以下に減らしたプレイヤーの勝利となります。</li>
              <li>ゲーム開始時、先攻プレイヤーをサーバーがランダムに決定し、山札から各5枚引きます。</li>
              <li>自分のターン開始時に山札から1枚ドロー。山札が0枚の時にドローすると敗北となります。</li>
            </ul>
          </div>

          {/* Section 2: Evolution Trees */}
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80">
            <h3 className="font-bold text-amber-300 mb-2 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4" /> 正式進化システム
            </h3>
            <p className="text-stone-300 mb-2">
              進化はカードを単純に交換するのではなく、<strong>「特定カードに別カードを付属／重ねる」</strong>ことで発生します。
            </p>
            <div className="space-y-1.5 font-mono text-[11px] bg-stone-950/80 p-2.5 rounded-lg border border-amber-900/60 text-stone-200">
              <div>綺麗なよしえ → [数珠カード付属] → 塩よしえ</div>
              <div>塩よしえ → [うんこかーど付属(ATK+50)] → 「普通に話すだけならいいよー（嘘）」嘉慧</div>
              <div>嘉慧 → [ユキやカード付属(ATK+100/HP+50)] → よしえEX</div>
              <div className="pt-1 border-t border-stone-800">吉田りゅうく → [ふともも使用] → リューク・スカイウォーカー</div>
              <div>まゆサブレ → [顎カード付属] → 顎・キャノン</div>
              <div>ヘッドフォンニキ ＋ ヘッドフォンニキ → [重ねる] → オンフードヘッドフォンニキ</div>
            </div>
          </div>

          {/* Section 3: Tsudanumazu & Buff Stacking */}
          <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700">
            <h3 className="font-bold text-amber-300 mb-2 flex items-center gap-1.5 text-sm">
              <Flame className="w-4 h-4 text-orange-400" /> 特殊効果「つだぬまず」と攻撃力重複計算
            </h3>
            <p className="text-stone-300 mb-1.5">
              <strong>【つだぬまず】</strong>はカードではなく特殊効果です。場に<strong className="text-yellow-400">「ムエ」「しょーちゃん」「おりちゃん」</strong>の3体がすべて存在している場合に自動発動し、3体すべての攻撃力を＋1000します！
            </p>
            <div className="p-2 rounded bg-stone-950/70 text-[11px] text-stone-300 border border-stone-700">
              <span className="font-bold text-amber-400">【重複計算例】</span>
              <div>ムエ(基礎1000) ＋ 浅草寺(1000) ＋ 隅田川(500) ＋ つだぬまず(1000) ＝ <strong className="text-emerald-400 font-bold">攻撃力 3500！</strong></div>
              <div className="text-[10px] text-stone-400 mt-0.5">※各種効果・環境・付属による攻撃力増減は重複して適用されます。</div>
            </div>
          </div>

          {/* Section 4: Card Categories */}
          <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700">
            <h3 className="font-bold text-amber-300 mb-1.5 flex items-center gap-1.5 text-sm">
              <Layers className="w-4 h-4" /> 3種類のカードカテゴリ
            </h3>
            <div className="space-y-1 text-stone-300">
              <div><strong className="text-amber-400">攻撃カード:</strong> 場に出して戦うカード（「キャラクターカード」名称は不使用）。</div>
              <div><strong className="text-blue-400">魔法カード:</strong> 特殊効果を発動するカード（通常魔法、付属カード、進化魔法）。</div>
              <div><strong className="text-emerald-400">環境カード:</strong> 場全体のルールや特定カードを変更するカード（盤面に1枚のみ有効）。</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
