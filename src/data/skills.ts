// SES で対応できる技術。旧サイトの開発実績ページの一覧に、Flutter / Dart（麻雀モンスターズで使用）と SwiftUI・Firebase を足したもの。
// 個々の案件とは結びつけない（実績の欄にツール名は書かない）。
export const skills: { group: string; items: string[] }[] = [
  { group: '言語', items: ['Swift', 'Objective-C', 'Kotlin', 'Java', 'Dart', 'C#', 'Python', 'PHP', 'C++', 'Lua', 'JavaScript'] },
  { group: 'フレームワーク', items: ['SwiftUI', 'UIKit', 'Cocoa', 'Android SDK', 'Flutter', 'Django', 'Cocos2d-x'] },
  { group: 'クラウド', items: ['Firebase'] },
  { group: 'テスト', items: ['XCTest', 'JUnit', 'Appium', 'JMeter', 'PHPUnit'] },
  { group: 'CI / CD', items: ['GitHub Actions', 'Bitrise', 'GitLab CI', 'Jenkins'] },
  { group: 'OS', items: ['iOS', 'Android', 'macOS', 'Windows', 'Ubuntu'] },
];
