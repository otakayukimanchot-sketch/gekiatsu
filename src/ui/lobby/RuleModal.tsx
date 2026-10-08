import React from 'react';
import { X, BookOpen, Sword, Zap, Trophy, Layers } from 'lucide-react';
import { LEVEL_STATS_TABLE } from '../../cards/levelSystem';
import { CardLevel } from '../../cards/types';

interface RuleModalProps {
  onClose: () => void;
}

export const RuleModal: React.FC<RuleModalProps> = ({ onClose }) => {
  const levels: CardLevel[] = [1, 2, 3, 4, 5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border-2 border-amber-500/80 shadow-2xl flex flex-col max-h-[90vh] text-stone-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 font-black text-sm text-amber-300">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>「ホンモノカードバトル」公式ルールブック</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-stone-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rules Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs leading-relaxed flex-1">
          {/* Section 1: Victory Condition */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <h3 className="font-black text-amber-300 mb-1.5 flex items-center gap-1.5 text-sm">
              <Trophy className="w-4 h-4" /> 勝利条件（3ポイント先取）
            </h3>
            <ul className="list-disc list-inside space-y-1 text-stone-200">
              <li>
                相手のバトル場のカードのHPを0にして「きぜつ」させると<strong>ポイントを獲得</strong>します。
              </li>
              <li>
                通常カード（Lv.1〜4）を倒すと<strong>1ポイント</strong>、最上位EXカード（Lv.5）を倒すと<strong>2ポイント</strong>獲得！
              </li>
              <li>
                先に<strong className="text-emerald-300">3ポイント</strong>を獲得するか、相手のベンチに控えカードがいなくなった時点で即勝利となります。
              </li>
            </ul>
          </div>

          {/* Section 2: Turn & Energy System */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <h3 className="font-black text-yellow-300 mb-1.5 flex items-center gap-1.5 text-sm">
              <Zap className="w-4 h-4" /> ターン進行とエネルギー・ベンチシステム
            </h3>
            <ul className="list-disc list-inside space-y-1 text-stone-200">
              <li>
                <strong>バトル場（1体）</strong>と<strong>ベンチ（最大3体）</strong>に攻撃カードを配置して戦います。
              </li>
              <li>
                自分のターン開始時、自動的に<strong>山札から1枚ドロー</strong>し、<strong>エネルギーゾーンにエネルギーが1個発生</strong>します。
              </li>
              <li>
                1ターンに1回、自分のバトル場またはベンチのカードに<strong>エネルギーを1個付与</strong>できます。
              </li>
              <li>
                必要なエネルギーが貯まったら<strong>「わざ攻撃」ボタン</strong>で相手を攻撃！攻撃を行うと自分のターンが終了します。
              </li>
              <li>
                バトル場のカードは、逃げるコスト分のエネルギーを消費してベンチのカードと<strong>「にげる（入れ替え）」</strong>ことができます（1ターン1回）。
              </li>
              <li>
                <strong className="text-amber-300">進化ルール:</strong>{' '}
                進化元が設定されている進化カードは、直接バトル場やベンチには出せません。前のターン以前に場に出ている対応する基礎カードに重ねて<strong>段階通りに進化</strong>させます（進化時、付与エネルギーを引き継ぎます）。
              </li>
            </ul>
          </div>

          {/* Section 3: 5-Level Uniform Stats Table */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <h3 className="font-black text-sky-300 mb-2 flex items-center gap-1.5 text-sm">
              <Sword className="w-4 h-4" /> 攻撃カード 5段階レベル別 統一能力値＆カラー
            </h3>
            <p className="text-stone-300 mb-2 text-[11px]">
              すべての攻撃カードはLv.1〜Lv.5に振り分けられ、レベルごとにHP・攻撃力・必要エネルギー・カード色が統一されています。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-950 text-stone-300 border-b border-slate-700">
                    <th className="p-1.5">レベル (色)</th>
                    <th className="p-1.5">HP</th>
                    <th className="p-1.5">攻撃力</th>
                    <th className="p-1.5">必要エネ</th>
                    <th className="p-1.5">にげる</th>
                    <th className="p-1.5">撃破Pt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {levels.map((lv) => {
                    const st = LEVEL_STATS_TABLE[lv];
                    const badgeStyles: Record<CardLevel, string> = {
                      1: 'bg-slate-300 text-slate-950',
                      2: 'bg-cyan-300 text-cyan-950',
                      3: 'bg-purple-300 text-purple-950',
                      4: 'bg-rose-300 text-rose-950',
                      5: 'bg-yellow-300 text-amber-950',
                    };
                    const colorNames: Record<CardLevel, string> = {
                      1: 'シルバー',
                      2: 'シアン',
                      3: 'パープル',
                      4: 'クリムゾン',
                      5: 'ゴールド',
                    };
                    return (
                      <tr key={lv} className="bg-slate-900/60">
                        <td className="p-1.5">
                          <span className={`px-1.5 py-0.5 rounded font-black ${badgeStyles[lv]}`}>
                            Lv.{lv} ({colorNames[lv]})
                          </span>
                        </td>
                        <td className="p-1.5 font-bold text-emerald-300">{st.hp}</td>
                        <td className="p-1.5 font-bold text-amber-300">{st.attack}</td>
                        <td className="p-1.5 font-bold text-yellow-300">⚡{st.energyCost}</td>
                        <td className="p-1.5 text-stone-300">⚡{st.retreatCost}</td>
                        <td className="p-1.5 font-bold text-white">{st.pointValue}pt</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Spell & Environment Cards */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <h3 className="font-black text-emerald-300 mb-1.5 flex items-center gap-1.5 text-sm">
              <Layers className="w-4 h-4" /> 魔法カード（ブルー）＆ 環境カード（エメラルド）
            </h3>
            <div className="space-y-1 text-stone-200">
              <div>
                <strong className="text-blue-300">魔法カード (Lv.1 / ブルー):</strong>{' '}
                エネルギー消費0で1ターンに1枚使用可能。「Superfly」（1枚ドロー）や火力強化・回復など即座に効果を発揮します。
              </div>
              <div>
                <strong className="text-emerald-300">環境カード (Lv.1 / エメラルド):</strong>{' '}
                フィールドの環境ゾーンに展開。「グロラン」（傷ついた自分の場のカードのHPを全回復）など戦局を有利にします。
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-200 text-xs font-bold cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
