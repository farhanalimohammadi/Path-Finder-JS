<template>
	<div class="about-page">
		<div class="about-card">
			<h1>درباره این پروژه</h1>

			<section class="about-section">
				<h2>این پروژه چیست و هدف از ساخت آن چیست؟</h2>
				<p>
					این وب‌اپ یک «ویژوالایزر مسیریابی سه‌بعدی» است که به شما اجازه می‌دهد
					الگوریتم‌های مختلف مسیریابی را به‌صورت زنده روی یک شبکه سه‌بعدی مشاهده کنید.
					در پسِ این پروژه، مفاهیم مهمی از <strong>ریاضی و علوم کامپیوتر</strong>
					مانند گراف‌ها، کوتاه‌ترین مسیر، و آنالیز الگوریتم‌ها قرار دارد.
				</p>
				<p>
					ایده‌ی اصلی این است که نشان دهد چطور می‌توان مفاهیم نظری ریاضی
					(مثل گراف و فاصله، و الگوریتم‌هایی مانند Dijkstra و A*)
					را به صورت یک تجربه‌ی بصری و تعاملی درآورد تا درک آن برای دانش‌آموزان و علاقه‌مندان ساده‌تر و جذاب‌تر شود.
				</p>
				<p>
					این پروژه به طور ویژه برای
					<strong>همایش ریاضی شهرستان سلطانیه</strong>
					طراحی و پیاده‌سازی شده است تا پیوندی بین
					ریاضیات، برنامه‌نویسی و دنیای واقعی ایجاد کند.
				</p>
			</section>

			<section class="about-section">
				<h2>سازنده پروژه</h2>
				<ul class="about-list">
					<li><span>نام:</span> فرحان علیمحمدی</li>
					<li><span>پایه و رشته:</span> پایه دوازدهم، رشته ریاضی</li>
					<li><span>مدرسه:</span> دبیرستان علامه حلی</li>
					<li><span>معلم راهنما:</span> دکتر سید امیر طاهری</li>
				</ul>
			</section>

			<section class="about-section">
				<h2>مهارت‌های برنامه‌نویسی و فناوری</h2>
				<p>
					این پروژه با تکیه بر تجربه و علاقه به توسعه‌ی وب و برنامه‌نویسی مدرن ساخته شده است.
					برخی از فناوری‌ها و مهارت‌های مرتبط:
				</p>
				<ul class="skills-list">
					<li><span>زبان‌ها:</span> JavaScript، TypeScript، Rust</li>
					<li><span>فریم‌ورک‌ها و کتابخانه‌ها:</span> Vue.js، React، Next.js، Node.js</li>
					<li><span>استایل و UI مدرن:</span> Sass / SCSS، Tailwind CSS، طراحی رابط کاربری دارک و مینیمال</li>
					<li><span>سایر مهارت‌ها:</span> کار با Three.js، انیمیشن‌های تعاملی، بهینه‌سازی تجربه کاربری (UX)</li>
				</ul>
			</section>

			<section class="about-section">
				<h2>گیت‌هاب و پروژه‌های دیگر</h2>
				<p>
					برای مشاهده‌ی این پروژه و سایر کارها و تجربیات برنامه‌نویسی، می‌توانید به
					حساب گیت‌هاب من سر بزنید:
				</p>
				<p class="github-link">
					<a
						href="https://github.com/farhanalimohammadi"
						target="_blank"
						rel="noopener noreferrer"
					>
						github.com/farhanalimohammadi
					</a>
				</p>
			</section>
		</div>
	</div>
</template>

<script>
export default {
	name: "AboutPage",
};
</script>

<style lang="scss">
@import '@/scss/variables.scss';

.about-page {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px 20px;
	background: radial-gradient(circle at top, $secondary-low 0%, #000 55%);
	color: #f5f5f5;
	direction: rtl;
}

.about-card {
	width: 100%;
	max-width: 900px;
	background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.06), rgba(0, 0, 0, 0.85));
	border-radius: 16px;
	padding: 32px 26px;
	box-shadow: 0 24px 80px rgba(0, 0, 0, 0.7);
	border: 1px solid rgba(255, 255, 255, 0.06);
	backdrop-filter: blur(12px);
}

.about-card h1 {
	font-size: 1.9rem;
	margin-bottom: 1.5rem;
	color: #ffffff;
}

.about-card h2 {
	font-size: 1.25rem;
	margin: 1.4rem 0 0.6rem;
	color: $warning;
}

.about-section p {
	line-height: 1.9;
	font-size: 0.95rem;
	margin: 0.4rem 0;
	opacity: 0.92;
}

.about-section strong {
	color: $secondary;
}

.about-list,
.skills-list {
	list-style: none;
	padding: 0;
	margin: 0.6rem 0 0;
}

.about-list li,
.skills-list li {
	margin: 0.35rem 0;
	font-size: 0.95rem;
}

.about-list li span,
.skills-list li span {
	color: $warning;
	font-weight: 600;
	margin-left: 4px;
}

@media (max-width: 768px) {
	.about-card {
		padding: 24px 18px;
	}

	.about-card h1 {
		font-size: 1.5rem;
	}
}
</style>


