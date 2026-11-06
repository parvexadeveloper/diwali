"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ta";

// Flat translation dictionaries. Keys are shared across all pages so the
// top-of-page dropdown switches every page's content at once.
const DICT: Record<Lang, Record<string, string>> = {
  en: {
    "lang.label": "Language",
    "lang.en": "English",
    "lang.ta": "தமிழ் (Tamil)",

    "brand": "DIWALI SPIN & WIN",
    "nav.account": "👤 Account",

    "footer.1": "Diwali Spin & Win — A festive promotion. This is the promotion's own account system; we never ask for your Instagram password.",
    "footer.2": "Prizes are decided securely on the server and cannot be changed from the browser. Delivery is confirmed after 2 friends play via your personal link.",
    "footer.3": "Happy Diwali! May your year be filled with light, health & prosperity. 🪔",

    "step.1": "Spin",
    "step.2": "Address",
    "step.3": "Account",
    "step.4": "Share & Confirm",

    "home.badge": "✦ FESTIVAL OF LIGHTS • LIMITED DIWALI OFFER ✦",
    "home.title.top": "🪔 DIWALI",
    "home.title.bottom": "SPIN & WIN",
    "home.subtitle.a": "Celebrate Diwali. Spin the wheel. Win ",
    "home.subtitle.b": "1g Gold, iPhone 17, Android Phone ₹20K",
    "home.subtitle.c": ", Silver & Gift Boxes!",
    "home.invited": "💚 You were invited by a friend — your spin will help confirm their gift delivery!",
    "stat.spins": "Spins",
    "stat.winners": "Winners",
    "stat.players": "Players",
    "stat.orders": "Orders",
    "home.spin": "✨ SPIN NOW — IT'S FREE ✨",
    "home.spinning": "🎡 SPINNING… GOOD LUCK! ✨",
    "home.spinHub": "SPIN",
    "home.secured": "🔒 Prize is decided securely on our server • Spin as many times as you like",
    "home.prizesHeading": "Prizes You Can Win",
    "home.recent": "🏆 RECENT RESULTS",
    "home.err.generic": "Something went wrong. Please try again.",
    "home.err.network": "Network error. Please check your connection and try again.",

    "how.1.t": "1 🎡", "how.1.d": "Spin the Wheel", "how.1.s": "Spin as many times as you like",
    "how.2.t": "2 📦", "how.2.d": "Add Address", "how.2.s": "Won a gift? Tell us where to deliver + email",
    "how.3.t": "3 👤", "how.3.d": "Log In", "how.3.s": "Your own Diwali Spin & Win account",
    "how.4.t": "4 💬", "how.4.d": "Share & Confirm", "how.4.s": "WhatsApp 2 friends → order confirmed!",

    "modal.congrats": "🎉 CONGRATULATIONS! 🎉",
    "modal.youWon": "You Won",
    "modal.next": "Next: add your delivery address + email, log in to your account, then share with 2 friends on WhatsApp to confirm delivery. 🚚",
    "modal.claim": "📦 Claim & Enter Address →",
    "modal.viewWheel": "View wheel",
    "modal.entryId": "Entry ID: {id}… • Secured server result • Cannot be changed",

    "prize.gold-1g.name": "1 Gram Gold", "prize.gold-1g.desc": "Certified 1 gram gold coin", "prize.gold-1g.value": "₹14,000 approx.",
    "prize.silver-1g.name": "15 Gram Silver", "prize.silver-1g.desc": "Certified 15 gram silver coin", "prize.silver-1g.value": "₹15,000 approx.",
    "prize.diwali-gift.name": "Diwali Gift Box", "prize.diwali-gift.desc": "Sweets, dry fruits & diyas hamper", "prize.diwali-gift.value": "₹999 hamper",
    "prize.iphone-17.name": "iPhone 17", "prize.iphone-17.desc": "Latest iPhone 17 — grand Diwali prize", "prize.iphone-17.value": "GRAND PRIZE",
    "prize.android-20k.name": "Android Phone ₹20K", "prize.android-20k.desc": "Android smartphone worth ₹20,000", "prize.android-20k.value": "Worth ₹20,000",

    "ship.loading": "Loading your prize… 🪔",
    "ship.spinFirst.title": "Spin First!",
    "ship.spinFirst.desc": "You need to spin the wheel and win a gift before adding a delivery address.",
    "ship.spinFirst.btn": "✨ Go to Spin Page →",
    "ship.congrats": "🎉 CONGRATULATIONS!",
    "ship.youWon": "You won: {prize}",
    "ship.subline": "Free home delivery after friend-share confirmation",
    "ship.formHeading": "📦 Delivery Address",
    "ship.fullName": "FULL NAME *",
    "ship.email": "EMAIL ID *",
    "ship.phone": "PHONE NUMBER *",
    "ship.addr1": "ADDRESS LINE 1 *",
    "ship.addr2": "ADDRESS LINE 2",
    "ship.city": "CITY *",
    "ship.state": "STATE *",
    "ship.pin": "POSTAL / PIN CODE *",
    "ship.country": "COUNTRY *",
    "ship.ph.fullName": "e.g. Priya Sharma",
    "ship.ph.email": "you@example.com",
    "ship.ph.phone": "+91 98765 43210",
    "ship.ph.addr1": "House no, street, area",
    "ship.ph.addr2": "Landmark (optional)",
    "ship.ph.city": "Mumbai",
    "ship.ph.state": "Maharashtra",
    "ship.ph.pin": "400001",
    "ship.save": "Save Address & Continue →",
    "ship.saving": "Saving… 🔒",
    "ship.secure": "🔒 Validated & saved securely on our server. Duplicate submissions are automatically prevented.",
    "ship.err.noSpin": "No winning spin found on this browser. Please spin first.",
    "ship.err.required": "Please fill all required fields marked *.",
    "ship.err.email": "Enter a valid email address — we will send delivery updates there.",
    "ship.err.pin": "Enter a valid 6-digit PIN code.",
    "ship.err.save": "Could not save address.",
    "ship.err.network": "Network error. Please try again.",

    "acct.winBanner": "🎉 You won {prize} — log in to view your prize & delivery status. 📦",
    "acct.username": "Username",
    "acct.password": "Password",
    "acct.show": "Show",
    "acct.hide": "Hide",
    "acct.login": "Log in",
    "acct.wait": "Please wait… 🔒",
    "acct.secure": "🔒 Your password is saved only as a secure bcrypt hash — never in plain text. This is Diwali Spin & Win's own account, not an Instagram login.",
    "acct.back": "← Back to spin page",
    "acct.popup.title": "Log in to Diwali Spin & Win",
    "acct.popup.desc": "Log in to your Diwali Spin & Win account, share your link with friends, and confirm your prize for delivery. 🎁",
    "acct.popup.note": "This is the promotion's own account — we never ask for your Instagram password.",
    "acct.popup.btn": "Continue to log in →",
    "acct.err.generic": "Something went wrong.",
    "acct.err.network": "Network error. Please try again.",

    "succ.loading": "Loading your prize… 🪔",
    "succ.noMe.title": "Log In First",
    "succ.noMe.desc": "Spin → add your address → log in, and your prize, WhatsApp share link & order status will appear here.",
    "succ.noMe.spin": "🎡 Spin Now",
    "succ.noMe.login": "Log In",
    "succ.congrats": "🎉 Congratulations{who}!",
    "succ.won": "Your Diwali Spin & Win entry has been successfully registered.",
    "succ.wonYou": "You won:",
    "succ.recorded": "Your prize and delivery details have been recorded successfully. Thank you for participating! 🪔 Happy Diwali! 🪔",
    "succ.deliverTo": "📦 Deliver to: {name}, {city}, {state} — {pin}",
    "succ.deliverNote": "Your gift will be delivered to the shipping address you provided.",
    "succ.addAddress": "Add your delivery address →",
    "succ.betterLuck": "Better luck next time! 🎆 Your entry is registered — we'll invite you to the next Diwali promotion. You can still invite friends below!",
    "succ.shareHeading": "💬 Final Step — Share with 2 Friends",
    "succ.shareDesc": "Share your personal link on WhatsApp with 2 friends. When both friends play the game, we deliver your product! 🚚",
    "succ.friendsPlayed": "👥 Friends who played via your link",
    "succ.friendPlayed": "✅ Friend {n} played!",
    "succ.friendPending": "⏳ Friend {n} pending",
    "succ.refresh": "↻ Refresh friend status (auto-refreshes every 8s)",
    "succ.linkLabel": "🔗 YOUR PERSONAL LINK (contains your ID)",
    "succ.copy": "📋 Copy",
    "succ.copied": "✅ Copied",
    "succ.linkMeta": "Link contains your user ID: {id}… • Referral code: {code} • Shares recorded: {count}",
    "succ.shareWa": "💬 Share on WhatsApp →",
    "succ.confirm": "🎉 Confirm My Order",
    "succ.confirmRe": "✅ Order Confirmed — Tap to Re-check Status",
    "succ.confirming": "Confirming… 🔒",
    "succ.statusReady": "🚚 STATUS: READY TO DELIVER — Both friends played! Your gift is being packed. 🪔",
    "succ.statusConfirmed": "📦 STATUS: CONFIRMED — Waiting for 2 friends to play, then we deliver!",
    "succ.statusShare": "⏳ STATUS: Share your link & confirm your order",
    "succ.card.account": "Account",
    "succ.card.noPrize": "No prize yet",
    "succ.card.spinToWin": "Spin the wheel to win",
    "succ.card.shares": "{n} shares",
    "succ.card.friends": "{n}/2 friends played",
    "succ.backSpin": "🎡 Back to Spin Page",
    "succ.inviteNote": " • Invite friends with your link above — each friend gets their own free spin!",
    "succ.waMessage": "🪔 Diwali Spin & Win! I just won {prize}! 🎉 Spin FREE & win 1g Gold, iPhone 17, Android Phone ₹20K & gift boxes. Play now 👉 {link}",
    "succ.waOpened": "✅ WhatsApp opened! Send it to 2 friends, then tap “Confirm My Order” below.",
    "succ.aPrize": "a Diwali gift",

    "admin.title": "Admin Panel",
    "admin.subtitle": "Diwali Spin & Win — players & winnings",
    "admin.login.title": "Admin Login",
    "admin.login.user": "Admin username",
    "admin.login.pass": "Admin password",
    "admin.login.btn": "Log in",
    "admin.login.wait": "Signing in…",
    "admin.login.err": "Incorrect admin username or password.",
    "admin.logout": "Log out",
    "admin.refresh": "↻ Refresh",
    "admin.loading": "Loading…",
    "admin.stat.spins": "Total Spins",
    "admin.stat.winners": "Winners",
    "admin.stat.players": "Registered Players",
    "admin.stat.orders": "Addresses / Orders",
    "admin.tab.players": "Players",
    "admin.tab.spins": "All Spins",
    "admin.col.when": "Date",
    "admin.col.user": "Username",
    "admin.col.email": "Email",
    "admin.col.prize": "Prize Won",
    "admin.col.value": "Value",
    "admin.col.type": "Type",
    "admin.col.address": "Delivery Address",
    "admin.col.friends": "Friends Played",
    "admin.col.status": "Order Status",
    "admin.empty": "No records yet.",
    "admin.na": "—",
  },
  ta: {
    "lang.label": "மொழி",
    "lang.en": "English",
    "lang.ta": "தமிழ் (Tamil)",

    "brand": "தீபாவளி சுழற்சி & வெற்றி",
    "nav.account": "👤 கணக்கு",

    "footer.1": "தீபாவளி சுழற்சி & வெற்றி — ஒரு பண்டிகை விளம்பரம். இது இந்த விளம்பரத்தின் சொந்த கணக்கு அமைப்பு; உங்கள் இன்ஸ்டாகிராம் கடவுச்சொல்லை நாங்கள் ஒருபோதும் கேட்க மாட்டோம்.",
    "footer.2": "பரிசுகள் சர்வரில் பாதுகாப்பாக தீர்மானிக்கப்படுகின்றன, உலாவியில் இருந்து மாற்ற முடியாது. உங்கள் தனிப்பட்ட இணைப்பு வழியாக 2 நண்பர்கள் விளையாடிய பிறகு டெலிவரி உறுதி செய்யப்படும்.",
    "footer.3": "இனிய தீபாவளி! உங்கள் ஆண்டு ஒளி, ஆரோக்கியம் & செழிப்பால் நிறையட்டும். 🪔",

    "step.1": "சுழற்று",
    "step.2": "முகவரி",
    "step.3": "கணக்கு",
    "step.4": "பகிர் & உறுதி",

    "home.badge": "✦ ஒளித் திருவிழா • வரம்பிட்ட தீபாவளி சலுகை ✦",
    "home.title.top": "🪔 தீபாவளி",
    "home.title.bottom": "சுழற்று & வெல்",
    "home.subtitle.a": "தீபாவளியைக் கொண்டாடுங்கள். சக்கரத்தைச் சுழற்றுங்கள். வெல்லுங்கள் ",
    "home.subtitle.b": "1கி தங்கம், iPhone 17, ஆண்ட்ராய்டு போன் ₹20K",
    "home.subtitle.c": ", வெள்ளி & பரிசுப் பெட்டிகள்!",
    "home.invited": "💚 ஒரு நண்பர் உங்களை அழைத்துள்ளார் — உங்கள் சுழற்சி அவர்களின் பரிசு டெலிவரியை உறுதி செய்ய உதவும்!",
    "stat.spins": "சுழற்சிகள்",
    "stat.winners": "வெற்றியாளர்கள்",
    "stat.players": "விளையாடியோர்",
    "stat.orders": "ஆர்டர்கள்",
    "home.spin": "✨ இப்போதே சுழற்று — இலவசம் ✨",
    "home.spinning": "🎡 சுழல்கிறது… வாழ்த்துக்கள்! ✨",
    "home.spinHub": "சுழற்று",
    "home.secured": "🔒 பரிசு எங்கள் சர்வரில் பாதுகாப்பாக தீர்மானிக்கப்படுகிறது • விரும்பிய அளவு சுழற்றலாம்",
    "home.prizesHeading": "நீங்கள் வெல்லக்கூடிய பரிசுகள்",
    "home.recent": "🏆 சமீபத்திய முடிவுகள்",
    "home.err.generic": "ஏதோ தவறு நேர்ந்தது. மீண்டும் முயற்சிக்கவும்.",
    "home.err.network": "இணைய பிழை. உங்கள் இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",

    "how.1.t": "1 🎡", "how.1.d": "சக்கரத்தைச் சுழற்று", "how.1.s": "விரும்பிய அளவு சுழற்றலாம்",
    "how.2.t": "2 📦", "how.2.d": "முகவரி சேர்", "how.2.s": "பரிசு வென்றீர்களா? எங்கு அனுப்புவது + மின்னஞ்சல் சொல்லுங்கள்",
    "how.3.t": "3 👤", "how.3.d": "உள்நுழை", "how.3.s": "உங்கள் சொந்த தீபாவளி சுழற்சி & வெற்றி கணக்கு",
    "how.4.t": "4 💬", "how.4.d": "பகிர் & உறுதி", "how.4.s": "2 நண்பர்களுக்கு வாட்ஸ்அப் → ஆர்டர் உறுதி!",

    "modal.congrats": "🎉 வாழ்த்துக்கள்! 🎉",
    "modal.youWon": "நீங்கள் வென்றது",
    "modal.next": "அடுத்து: உங்கள் டெலிவரி முகவரி + மின்னஞ்சலைச் சேர்த்து, கணக்கில் உள்நுழைந்து, பின் வாட்ஸ்அப்பில் 2 நண்பர்களுடன் பகிர்ந்து டெலிவரியை உறுதி செய்யுங்கள். 🚚",
    "modal.claim": "📦 பெற்று முகவரி பதிவு செய் →",
    "modal.viewWheel": "சக்கரத்தைப் பார்",
    "modal.entryId": "பதிவு ஐடி: {id}… • பாதுகாப்பான சர்வர் முடிவு • மாற்ற முடியாது",

    "prize.gold-1g.name": "1 கிராம் தங்கம்", "prize.gold-1g.desc": "சான்றளிக்கப்பட்ட 1 கிராம் தங்க நாணயம்", "prize.gold-1g.value": "சுமார் ₹14,000",
    "prize.silver-1g.name": "15 கிராம் வெள்ளி", "prize.silver-1g.desc": "சான்றளிக்கப்பட்ட 15 கிராம் வெள்ளி நாணயம்", "prize.silver-1g.value": "சுமார் ₹15,000",
    "prize.diwali-gift.name": "தீபாவளி பரிசுப் பெட்டி", "prize.diwali-gift.desc": "இனிப்புகள், உலர் பழங்கள் & அகல் விளக்குகள் தொகுப்பு", "prize.diwali-gift.value": "₹999 தொகுப்பு",
    "prize.iphone-17.name": "iPhone 17", "prize.iphone-17.desc": "சமீபத்திய iPhone 17 — மாபெரும் தீபாவளி பரிசு", "prize.iphone-17.value": "மாபெரும் பரிசு",
    "prize.android-20k.name": "ஆண்ட்ராய்டு போன் ₹20K", "prize.android-20k.desc": "₹20,000 மதிப்புள்ள ஆண்ட்ராய்டு ஸ்மார்ட்போன்", "prize.android-20k.value": "₹20,000 மதிப்பு",

    "ship.loading": "உங்கள் பரிசை ஏற்றுகிறது… 🪔",
    "ship.spinFirst.title": "முதலில் சுழற்றுங்கள்!",
    "ship.spinFirst.desc": "டெலிவரி முகவரியைச் சேர்ப்பதற்கு முன் சக்கரத்தைச் சுழற்றி ஒரு பரிசை வெல்ல வேண்டும்.",
    "ship.spinFirst.btn": "✨ சுழற்சி பக்கத்திற்குச் செல் →",
    "ship.congrats": "🎉 வாழ்த்துக்கள்!",
    "ship.youWon": "நீங்கள் வென்றது: {prize}",
    "ship.subline": "நண்பர் பகிர்வு உறுதிக்குப் பிறகு இலவச வீட்டு டெலிவரி",
    "ship.formHeading": "📦 டெலிவரி முகவரி",
    "ship.fullName": "முழு பெயர் *",
    "ship.email": "மின்னஞ்சல் முகவரி *",
    "ship.phone": "தொலைபேசி எண் *",
    "ship.addr1": "முகவரி வரி 1 *",
    "ship.addr2": "முகவரி வரி 2",
    "ship.city": "நகரம் *",
    "ship.state": "மாநிலம் *",
    "ship.pin": "அஞ்சல் / பின் குறியீடு *",
    "ship.country": "நாடு *",
    "ship.ph.fullName": "எ.கா. பிரியா சர்மா",
    "ship.ph.email": "you@example.com",
    "ship.ph.phone": "+91 98765 43210",
    "ship.ph.addr1": "வீட்டு எண், தெரு, பகுதி",
    "ship.ph.addr2": "அடையாள இடம் (விருப்பம்)",
    "ship.ph.city": "மும்பை",
    "ship.ph.state": "தமிழ்நாடு",
    "ship.ph.pin": "600001",
    "ship.save": "முகவரியைச் சேமித்து தொடரவும் →",
    "ship.saving": "சேமிக்கிறது… 🔒",
    "ship.secure": "🔒 எங்கள் சர்வரில் சரிபார்த்து பாதுகாப்பாக சேமிக்கப்படுகிறது. நகல் சமர்ப்பிப்புகள் தானாகவே தடுக்கப்படும்.",
    "ship.err.noSpin": "இந்த உலாவியில் வெற்றி சுழற்சி எதுவும் இல்லை. முதலில் சுழற்றுங்கள்.",
    "ship.err.required": "* குறியிட்ட அனைத்து புலங்களையும் நிரப்பவும்.",
    "ship.err.email": "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும் — டெலிவரி புதுப்பிப்புகளை அங்கே அனுப்புவோம்.",
    "ship.err.pin": "சரியான 6-இலக்க பின் குறியீட்டை உள்ளிடவும்.",
    "ship.err.save": "முகவரியைச் சேமிக்க முடியவில்லை.",
    "ship.err.network": "இணைய பிழை. மீண்டும் முயற்சிக்கவும்.",

    "acct.winBanner": "🎉 நீங்கள் {prize} வென்றீர்கள் — உங்கள் பரிசு & டெலிவரி நிலையைப் பார்க்க உள்நுழையுங்கள். 📦",
    "acct.username": "பயனர் பெயர்",
    "acct.password": "கடவுச்சொல்",
    "acct.show": "காட்டு",
    "acct.hide": "மறை",
    "acct.login": "உள்நுழை",
    "acct.wait": "காத்திருக்கவும்… 🔒",
    "acct.secure": "🔒 உங்கள் கடவுச்சொல் பாதுகாப்பான bcrypt ஹாஷ் ஆக மட்டுமே சேமிக்கப்படுகிறது — ஒருபோதும் வெற்று உரையாக அல்ல. இது தீபாவளி சுழற்சி & வெற்றியின் சொந்த கணக்கு, இன்ஸ்டாகிராம் உள்நுழைவு அல்ல.",
    "acct.back": "← சுழற்சி பக்கத்திற்குத் திரும்பு",
    "acct.popup.title": "தீபாவளி சுழற்சி & வெற்றியில் உள்நுழையுங்கள்",
    "acct.popup.desc": "உங்கள் தீபாவளி சுழற்சி & வெற்றி கணக்கில் உள்நுழைந்து, உங்கள் இணைப்பை நண்பர்களுடன் பகிர்ந்து, டெலிவரிக்கு உங்கள் பரிசை உறுதி செய்யுங்கள். 🎁",
    "acct.popup.note": "இது விளம்பரத்தின் சொந்த கணக்கு — உங்கள் இன்ஸ்டாகிராம் கடவுச்சொல்லை நாங்கள் ஒருபோதும் கேட்க மாட்டோம்.",
    "acct.popup.btn": "உள்நுழைய தொடரவும் →",
    "acct.err.generic": "ஏதோ தவறு நேர்ந்தது.",
    "acct.err.network": "இணைய பிழை. மீண்டும் முயற்சிக்கவும்.",

    "succ.loading": "உங்கள் பரிசை ஏற்றுகிறது… 🪔",
    "succ.noMe.title": "முதலில் உள்நுழையுங்கள்",
    "succ.noMe.desc": "சுழற்று → முகவரி சேர் → உள்நுழை, உங்கள் பரிசு, வாட்ஸ்அப் பகிர்வு இணைப்பு & ஆர்டர் நிலை இங்கே தோன்றும்.",
    "succ.noMe.spin": "🎡 இப்போதே சுழற்று",
    "succ.noMe.login": "உள்நுழை",
    "succ.congrats": "🎉 வாழ்த்துக்கள்{who}!",
    "succ.won": "உங்கள் தீபாவளி சுழற்சி & வெற்றி பதிவு வெற்றிகரமாக பதிவு செய்யப்பட்டது.",
    "succ.wonYou": "நீங்கள் வென்றது:",
    "succ.recorded": "உங்கள் பரிசு மற்றும் டெலிவரி விவரங்கள் வெற்றிகரமாக பதிவு செய்யப்பட்டன. பங்கேற்றதற்கு நன்றி! 🪔 இனிய தீபாவளி! 🪔",
    "succ.deliverTo": "📦 அனுப்புமிடம்: {name}, {city}, {state} — {pin}",
    "succ.deliverNote": "நீங்கள் வழங்கிய அனுப்பும் முகவரிக்கு உங்கள் பரிசு வழங்கப்படும்.",
    "succ.addAddress": "உங்கள் டெலிவரி முகவரியைச் சேர் →",
    "succ.betterLuck": "அடுத்த முறை நல்ல அதிர்ஷ்டம்! 🎆 உங்கள் பதிவு பதிவு செய்யப்பட்டது — அடுத்த தீபாவளி விளம்பரத்திற்கு உங்களை அழைப்போம். கீழே நண்பர்களை இன்னும் அழைக்கலாம்!",
    "succ.shareHeading": "💬 இறுதி படி — 2 நண்பர்களுடன் பகிர்",
    "succ.shareDesc": "உங்கள் தனிப்பட்ட இணைப்பை வாட்ஸ்அப்பில் 2 நண்பர்களுடன் பகிருங்கள். இருவரும் விளையாடியதும், உங்கள் பரிசை வழங்குவோம்! 🚚",
    "succ.friendsPlayed": "👥 உங்கள் இணைப்பு வழியாக விளையாடிய நண்பர்கள்",
    "succ.friendPlayed": "✅ நண்பர் {n} விளையாடினார்!",
    "succ.friendPending": "⏳ நண்பர் {n} நிலுவையில்",
    "succ.refresh": "↻ நண்பர் நிலையைப் புதுப்பி (ஒவ்வொரு 8வி-க்கும் தானாக புதுப்பிக்கும்)",
    "succ.linkLabel": "🔗 உங்கள் தனிப்பட்ட இணைப்பு (உங்கள் ஐடியைக் கொண்டுள்ளது)",
    "succ.copy": "📋 நகலெடு",
    "succ.copied": "✅ நகலெடுக்கப்பட்டது",
    "succ.linkMeta": "இணைப்பில் உங்கள் பயனர் ஐடி: {id}… • பரிந்துரை குறியீடு: {code} • பதிவான பகிர்வுகள்: {count}",
    "succ.shareWa": "💬 வாட்ஸ்அப்பில் பகிர் →",
    "succ.confirm": "🎉 என் ஆர்டரை உறுதி செய்",
    "succ.confirmRe": "✅ ஆர்டர் உறுதி — நிலையை மீண்டும் சரிபார்க்க தட்டவும்",
    "succ.confirming": "உறுதி செய்கிறது… 🔒",
    "succ.statusReady": "🚚 நிலை: வழங்க தயார் — இரு நண்பர்களும் விளையாடினர்! உங்கள் பரிசு பொதி செய்யப்படுகிறது. 🪔",
    "succ.statusConfirmed": "📦 நிலை: உறுதி — 2 நண்பர்கள் விளையாட காத்திருக்கிறோம், பின் வழங்குவோம்!",
    "succ.statusShare": "⏳ நிலை: உங்கள் இணைப்பைப் பகிர்ந்து ஆர்டரை உறுதி செய்யுங்கள்",
    "succ.card.account": "கணக்கு",
    "succ.card.noPrize": "இன்னும் பரிசு இல்லை",
    "succ.card.spinToWin": "வெல்ல சக்கரத்தைச் சுழற்று",
    "succ.card.shares": "{n} பகிர்வுகள்",
    "succ.card.friends": "{n}/2 நண்பர்கள் விளையாடினர்",
    "succ.backSpin": "🎡 சுழற்சி பக்கத்திற்குத் திரும்பு",
    "succ.inviteNote": " • மேலே உள்ள இணைப்பால் நண்பர்களை அழையுங்கள் — ஒவ்வொரு நண்பருக்கும் தனி இலவச சுழற்சி கிடைக்கும்!",
    "succ.waMessage": "🪔 தீபாவளி சுழற்சி & வெற்றி! நான் {prize} வென்றேன்! 🎉 இலவசமாக சுழற்றி 1கி தங்கம், iPhone 17, ஆண்ட்ராய்டு போன் ₹20K & பரிசுப் பெட்டிகள் வெல்லுங்கள். இப்போதே விளையாடு 👉 {link}",
    "succ.waOpened": "✅ வாட்ஸ்அப் திறக்கப்பட்டது! 2 நண்பர்களுக்கு அனுப்பி, கீழே “என் ஆர்டரை உறுதி செய்” என்பதைத் தட்டவும்.",
    "succ.aPrize": "ஒரு தீபாவளி பரிசு",

    "admin.title": "நிர்வாக பலகம்",
    "admin.subtitle": "தீபாவளி சுழற்சி & வெற்றி — விளையாடியோர் & வெற்றிகள்",
    "admin.login.title": "நிர்வாக உள்நுழைவு",
    "admin.login.user": "நிர்வாக பயனர் பெயர்",
    "admin.login.pass": "நிர்வாக கடவுச்சொல்",
    "admin.login.btn": "உள்நுழை",
    "admin.login.wait": "உள்நுழைகிறது…",
    "admin.login.err": "தவறான நிர்வாக பயனர் பெயர் அல்லது கடவுச்சொல்.",
    "admin.logout": "வெளியேறு",
    "admin.refresh": "↻ புதுப்பி",
    "admin.loading": "ஏற்றுகிறது…",
    "admin.stat.spins": "மொத்த சுழற்சிகள்",
    "admin.stat.winners": "வெற்றியாளர்கள்",
    "admin.stat.players": "பதிவான விளையாடியோர்",
    "admin.stat.orders": "முகவரிகள் / ஆர்டர்கள்",
    "admin.tab.players": "விளையாடியோர்",
    "admin.tab.spins": "அனைத்து சுழற்சிகள்",
    "admin.col.when": "தேதி",
    "admin.col.user": "பயனர் பெயர்",
    "admin.col.email": "மின்னஞ்சல்",
    "admin.col.prize": "வென்ற பரிசு",
    "admin.col.value": "மதிப்பு",
    "admin.col.type": "வகை",
    "admin.col.address": "டெலிவரி முகவரி",
    "admin.col.friends": "விளையாடிய நண்பர்கள்",
    "admin.col.status": "ஆர்டர் நிலை",
    "admin.empty": "இன்னும் பதிவுகள் இல்லை.",
    "admin.na": "—",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string, vars?: Record<string, string | number>) => string };
const I18nContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try { const saved = localStorage.getItem("diwali_lang"); if (saved === "en" || saved === "ta") setLangState(saved); } catch {}
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("diwali_lang", l); } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const raw = DICT[lang][key] ?? DICT.en[key] ?? key;
    return vars ? raw.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`)) : raw;
  }, [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) return { lang: "en", setLang: () => {}, t: (k) => DICT.en[k] ?? k };
  return ctx;
}

export function LangSwitcher() {
  const { lang, setLang, t } = useI18n();
  return (
    <label className="flex items-center gap-1.5 text-xs font-semibold">
      <span aria-hidden>🌐</span>
      <span className="sr-only">{t("lang.label")}</span>
      <select
        value={lang}
        onChange={e => setLang(e.target.value as Lang)}
        className="bg-[#2a0a4a] text-white border border-amber-300/40 rounded-full px-2.5 py-1.5 font-bold focus:border-amber-300"
        aria-label={t("lang.label")}
      >
        <option value="en">🇬🇧 {t("lang.en")}</option>
        <option value="ta">🇮🇳 {t("lang.ta")}</option>
      </select>
    </label>
  );
}
