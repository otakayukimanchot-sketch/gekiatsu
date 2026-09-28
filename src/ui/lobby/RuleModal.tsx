import React from 'react';
import { X, BookOpen, Shield, Sword, Sparkles, Globe, Layers, ArrowRight } from 'lucide-react';

interface RuleModalProps {
  onClose: () => void;
}

export const RuleModal: React.FC<RuleModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-stone-900 border-2 border-amber-600/80 shadow-2xl flex flex-col max-h-[90vh] text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>「本物カードバトル」公式ルールブック</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rules Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs leading-relaxed flex-1">
          {/* Section 1: Objective & HP */}
          <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700">
            <h3 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 text-sm">
              <Sword className="w-4 h-4" /> 勝利条件と基本ステータス
            </h3>
            <p className="text-stone-300">
              各プレイヤーは<strong className="text-rose-400 font-bold">HP 5000</strong>でスタートします。
              相手プレイヤーのHPを0以下に減らしたプレイヤーが勝利します。
            </p>
          </div>

          {/* Section 2: Deck & Draw */}
          <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700">
            <h3 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4" /> デッキと手札
            </h3>
            <ul className="list-disc list-inside space-y-1 text-stone-300">
              <li>デッキ枚数は<strong>40枚</strong>。同名カードは最大3枚まで。</li>
              <li>初期手札は<strong>5枚</strong>、手札上限は<strong>10枚</strong>。</li>
              <li>自分のターン開始時に山札から1枚ドロー。</li>
              <li>先攻・後攻はサーバーがランダム決定。先攻は1ターン目ドローなし・攻撃可能。後攻は1ターン目ドローあり。</li>
              <li>山札が0枚の状態でドローを行おうとした場合、そのプレイヤーは<strong className="text-rose-400 font-bold">敗北</strong>となります。</li>
            </ul>
          </div>

          {/* Section 3: Card Categories */}
          <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700">
            <h3 className="font-bold text-amber-300 mb-2 flex items-center gap-1.5 text-sm">
              <Layers className="w-4 h-4" /> 3種類のカード
            </h3>
            <div className="space-y-2">
              <div className="p-2 rounded bg-amber-950/40 border border-amber-800">
                <span className="font-bold text-amber-400">1. 攻撃カード</span>
                <p className="text-stone-300 mt-0.5">場に配置して相手カードや相手プレイヤーを攻撃する主戦力。場には最大5体まで配置可能。</p>
              </div>
              <div className="p-2 rounded bg-blue-950/40 border border-blue-800">
                <span className="font-bold text-blue-400">2. 魔法カード</span>
                <p className="text-stone-300 mt-0.5">即時ダメージ・回復などの通常魔法、攻撃カードの下に重ねて強化する<strong>付着カード</strong>、味方を進化させる<strong>進化魔法</strong>が存在します。</p>
              </div>
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800">
                <span className="font-bold text-emerald-400">3. 環境カード</span>
                <p className="text-stone-300 mt-0.5">戦場全体に永続効果をもたらすカード。盤面に存在できるのは<strong>1枚のみ</strong>で、新しい環境カードを出すと古いものは墓地へ送られます。</p>
              </div>
            </div>
          </div>

          {/* Section 4: Key Keywords */}
          <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700">
            <h3 className="font-bold text-amber-300 mb-1 flex items-center gap-1.5 text-sm">
              <Shield className="w-4 h-4" /> 特殊キーワード
            </h3>
            <div className="space-y-1.5 text-stone-300">
              <div><strong className="text-amber-300">【守護】:</strong> 相手の場に守護カードがいる場合、相手はその守護カードを優先して攻撃しなければなりません（直接攻撃不可）。</div>
              <div><strong className="text-emerald-300">【突撃】:</strong> 場に出したそのターンに即座に攻撃が可能です。</div>
              <div><strong className="text-purple-300">【進化】:</strong> 特定の攻撃カードは強力な上位カードへ進化可能。進化召喚時効果が発動します。</div>
              <div><strong className="text-yellow-300">【知らんけど】:</strong> サーバー側乱数で、奇跡の大打撃か何も起きないかが判定されるロマン効果！</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
