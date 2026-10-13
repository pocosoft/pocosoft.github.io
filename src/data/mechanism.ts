export const mechanism: { no: string; actor: 'HUMAN' | 'AI'; title: string; text: string }[] = [
  { no: '01', actor: 'HUMAN', title: '人が決める', text: '何をつくり、何を良しとするか。人が決めたことを、AIが読める仕様とテスト観点に落とし込みます。' },
  { no: '02', actor: 'AI', title: 'AIが実装する', text: '複数のAIエージェントが並行して実装を進めます。夜間も休日も、手は止まりません。' },
  { no: '03', actor: 'AI', title: 'AIが確かめる', text: 'AIが実際にアプリを操作し、動作確認と回帰テストを24時間回し続けます。' },
  { no: '04', actor: 'HUMAN', title: '人が判断する', text: '結果と差分を人がレビューし、リリースを判断します。学びは次のループへ。' },
];
