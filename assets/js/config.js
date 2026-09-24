/* =====================================================================
 * ピュアモルト チタンスコップ  サイト設定ファイル（config.js）
 * ---------------------------------------------------------------------
 * ■ このファイルの役割
 *   商品名・価格・スペック・送料・販売条件・事業者情報など、サイト全体で
 *   使う情報をここに一か所でまとめています。各ページはこの値を読み込んで
 *   表示するため、基本的には「このファイルだけ」を編集すれば全ページに
 *   反映されます。
 *
 * ■ 編集のしかた
 *   - 文字は '（シングルクォート）で囲んだ部分だけを書き換えてください。
 *   - 価格（price）・送料（fee）は数字のみ（カンマ・円記号なし、税込金額）。
 *     例：39800
 *   - 行末のカンマ「,」や括弧「{ } [ ]」を消さないよう注意してください。
 *   - 保存後、ブラウザを再読み込みすると反映されます。
 *
 * ■ Stripe決済リンク（Payment Links）の設定
 *   - 各商品の stripePaymentLink に、Stripeダッシュボードで作成した
 *     Payment Link のURL（https://buy.stripe.com/... ）を貼り付けます。
 *     剣先 → products.kensaki.stripePaymentLink
 *     角   → products.kaku.stripePaymentLink
 *   - 空欄（''）のままの場合は「デモモード」となり、購入ボタンを押すと
 *     実際の決済は行われず、デモ用の完了画面（thanks.html?demo=1）へ移動します。
 *   - Stripe側の商品名・価格（税込）・送料・配送/返品条件は、必ずこの
 *     ファイルの内容と一致させてください。
 *
 * ■ 公開前に必ず行うこと
 *   1. 「// 【仮】」と書かれた値は、すべて仮の設定です。公開前に一つずつ
 *      確認し、正しい値に修正してください（確認後はコメントを消してOK）。
 *   2. seller（事業者情報）の '【要入力】' をすべて正しい情報に置き換えて
 *      ください（特定商取引法に基づく表記に表示されます）。
 *   3. 全ページ（*.html）の <head> 内にある
 *        <meta name="robots" content="noindex">
 *      の行を削除してください（削除しないと検索エンジンに表示されません）。
 *   4. brand.siteUrl に公開URL（例：https://example.com）を入力してください。
 *      ※現在この値は控え（メモ）用で、ページには自動反映されません。
 *        index.html の og:image / twitter:image は手作業で絶対URLに書き換えてください。
 * ===================================================================== */

window.SITE_CONFIG = {
  brand: {
    name: 'PURE MALT TITANIUM SHOVEL', // 【仮】
    nameJa: 'ピュアモルト チタンスコップ', // 【仮】
    tagline: '現場の一本を、チタンで。', // 【仮】
    siteUrl: '' // 公開時に入力（例：https://example.com）
  },

  // 表示順（剣先 → 角）
  productOrder: ['kensaki', 'kaku'],

  shipping: {
    fee: 0, // 【仮】 送料（税込・円）
    label: '全国送料無料', // 【仮】
    note: '※離島など一部地域は別途ご案内となる場合があります。' // 【仮】
  },

  // 1回のご注文で購入できる最大数量。Stripe Payment Link の「数量調整」の最大値と必ず同じ数にしてください。
  maxQuantity: 10, // 【仮】 Stripe Payment Link の数量上限と必ず同じ値にする

  products: {
    kensaki: {
      id: 'kensaki',
      name: 'ピュアモルト チタンスコップ 剣先', // 【仮】
      variantLabel: '剣先',
      variantEn: 'KENSAKI',
      price: 39800, // 【仮】 販売価格（税込・円）
      stripePaymentLink: '', // Stripe Payment Link のURLを貼り付け（空欄＝デモモード）
      catch: '硬い地盤に、鋭く入る。', // 【仮】
      description: '先端の尖った剣先ブレードを、ブレードから柄までチタニウムで仕立てた一本。掘削や根切り、締まった土への差し込みなど、「掘る」作業のためのモデルです。握る部分には、ピュアモルトウイスキーの瓶に使われていたコルク栓を再利用した天然コルクのグリップを備えています。', // 【仮】
      uses: ['掘削・穴掘り', '根切り', '硬い土・締まった地盤への差し込み', '溝掘り'], // 【仮】
      specs: [
        { label: '全長', value: '約1,150mm' }, // 【仮】
        { label: 'ブレード（幅×長さ）', value: '約230×290mm' }, // 【仮】
        { label: '重量', value: '約1,100g' } // 【仮】
      ],
      images: {
        studio: 'assets/img/kensaki-studio.jpg',
        scene: 'assets/img/scene-kensaki.jpg'
      }
    },

    kaku: {
      id: 'kaku',
      name: 'ピュアモルト チタンスコップ 角', // 【仮】
      variantLabel: '角',
      variantEn: 'KAKU',
      price: 42800, // 【仮】 販売価格（税込・円）
      stripePaymentLink: '', // Stripe Payment Link のURLを貼り付け（空欄＝デモモード）
      catch: 'すくう、ならす、運ぶ。', // 【仮】
      description: '平らな角型ブレードを、ブレードから柄までチタニウムで仕立てた一本。砂・砂利・土をすくう、運ぶ、ならすといった作業のためのモデルです。握る部分には、ピュアモルトウイスキーの瓶に使われていたコルク栓を再利用した天然コルクのグリップを備えています。', // 【仮】
      uses: ['砂・砂利・土のすくい上げ', '土砂の積み込み・運搬', '地面のならし', '仕上げ・清掃'], // 【仮】
      specs: [
        { label: '全長', value: '約1,150mm' }, // 【仮】
        { label: 'ブレード（幅×長さ）', value: '約250×300mm' }, // 【仮】
        { label: '重量', value: '約1,250g' } // 【仮】
      ],
      images: {
        studio: 'assets/img/kaku-studio.jpg',
        scene: 'assets/img/scene-kaku.jpg'
      }
    }
  },

  commonImages: {
    hero: 'assets/img/hero.jpg',
    grip: 'assets/img/grip-cork.jpg',
    titanium: 'assets/img/titanium-detail.jpg'
  },

  commonSpecs: [
    { label: '素材（ブレード・柄）', value: 'チタニウム' },
    { label: 'グリップ', value: '天然コルク（ピュアモルトウイスキーのコルク栓を再利用）' },
    { label: '柄の形状', value: 'ストレート（丸柄）' }
  ],

  // 事業者情報（特定商取引法に基づく表記・フッター等に表示）
  // '【要入力】' を必ず正しい情報に置き換えてください。
  seller: {
    name: '【要入力】', // 販売事業者名
    representative: '【要入力】', // 運営統括責任者
    address: '【要入力】', // 所在地
    phone: '【要入力】', // 電話番号
    email: '【要入力】', // メールアドレス
    hours: '【要入力】', // 営業時間（お問い合わせ受付時間）
    url: '' // 事業者サイトURL（任意）
  },

  // 販売条件（Stripe側の設定・表示と必ず一致させてください）
  policies: {
    paymentMethods: 'クレジットカード（Visa／Mastercard／JCB／American Express／Diners Club／Discover）、Apple Pay、Google Pay（お支払い画面に表示される方法からお選びいただけます）', // 【仮】
    paymentTiming: 'ご注文時（Stripeの決済画面でお支払いが完了した時点）に決済されます。カード代金の引き落とし日は各カード会社の規定によります。', // 【仮】
    deliveryTiming: 'ご注文確定後、5営業日以内に発送いたします。', // 【仮】
    returns: '商品到着後8日以内、未使用品に限り返品を承ります。お客様都合による返品の送料はお客様のご負担となります。', // 【仮】
    defective: '不良品・誤配送の場合は、商品到着後8日以内にご連絡ください。当社負担で交換または返金いたします。', // 【仮】
    cancellation: '発送前のご注文はキャンセルを承ります。お問い合わせ先までご連絡ください。発送後のキャンセルは返品の扱いとなります。', // 【仮】
    otherFees: '商品代金・送料以外に必要な料金はありません。' // 【仮】
  }
};
