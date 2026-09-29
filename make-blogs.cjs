const fs = require('fs');
const path = require('path');

const blogs = [
  {
    dir: 'face-analyzer-free',
    title: 'Face Analyzer Free: The Best Tools Available',
    description: 'Looking for a face analyzer free of charge? Discover the best tools to analyze your facial features and get detailed reports without spending a dime.',
    keyword: 'face analyzer free'
  },
  {
    dir: 'ai-face-analyzer-free',
    title: 'AI Face Analyzer Free: Next-Gen Facial Recognition',
    description: 'Use an AI face analyzer free online. Understand your apparent age, face shape, and features using advanced artificial intelligence completely free.',
    keyword: 'ai face analyzer free'
  },
  {
    dir: 'what-features-do-i-have',
    title: 'What Features Do I Have? AI Face Analysis Guide',
    description: 'Wondering "what features do I have?" Upload your photo to our AI face analyzer to find out your face shape, eye color, and unique facial characteristics.',
    keyword: 'what features do i have'
  }
];

const templatePath = path.join(__dirname, 'public/blog/how-to-take-a-good-face-photo/index.html');
const template = fs.readFileSync(templatePath, 'utf8');

blogs.forEach(blog => {
  const dirPath = path.join(__dirname, 'public/blog', blog.dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Replace content in template
  let newHtml = template
    .replace(/<title>.*?<\/title>/, `<title>${blog.title} | Face Portal</title>`)
    .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${blog.description}">`)
    .replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="https://faceportal.example.com/blog/${blog.dir}/">`)
    .replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${blog.title}">`)
    .replace(/<meta property="og:description" content=".*?">/, `<meta property="og:description" content="${blog.description}">`)
    .replace(/<h1>.*?<\/h1>/, `<h1>${blog.title}</h1>`)
    .replace(/<p class="article-tagline">.*?<\/p>/, `<p class="article-tagline">${blog.description}</p>`)
    .replace(/<div class="breadcrumb">.*?<\/div>/, `<div class="breadcrumb"><a href="/">Home</a> › <a href="/blog/">Blog</a> › ${blog.title}</div>`);

  // Just add a quick SEO text paragraph for the article content
  const articleContentRegex = /<div class="article-content">[\s\S]*?<\/div>\s*<\/article>/;
  const newContent = `<div class="article-content">
    <p>If you're searching for <strong>${blog.keyword}</strong>, you've come to the right place. Our advanced AI tools provide detailed insights into your facial structure, expressions, and features.</p>
    <h2>Understanding Your Results</h2>
    <p>When you use our tool, you'll receive a comprehensive breakdown of your facial characteristics. This includes estimates for apparent age, face shape, and even micro-expressions. We leverage state-of-the-art vision models to bring you these insights.</p>
    <h2>Why Use Our Tool?</h2>
    <p>Our platform is designed to be accessible, fast, and completely free to use. You don't need any special software or technical knowledge. Just upload a clear photo and let the AI do the work.</p>
  </div>
  </article>`;
  
  newHtml = newHtml.replace(articleContentRegex, newContent);
  
  // also replace sidebar contents
  const sidebarRegex = /<aside class="article-sidebar">[\s\S]*?<\/aside>/;
  const newSidebar = `<aside class="article-sidebar">
    <div class="sidebar-cta">
      <div class="panel-title">TRY THE TOOL</div>
      <div class="sidebar-cta-body">
        <p>Get your free face analysis report today.</p>
        <a href="/analyzer/">Open the Analyzer →</a>
      </div>
    </div>
  </aside>`;
  
  newHtml = newHtml.replace(sidebarRegex, newSidebar);

  fs.writeFileSync(path.join(dirPath, 'index.html'), newHtml);
  console.log(`Created ${blog.dir}`);
});

// Update blog index
const indexPath = path.join(__dirname, 'public/blog/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const newCards = blogs.map(blog => `
      <a class="blog-card" href="/blog/${blog.dir}/">
        <div class="blog-card-head">GUIDE · 4 MIN READ</div>
        <div class="blog-card-body">
          <h2>${blog.title}</h2>
          <p>${blog.description}</p>
          <div class="blog-card-meta">AI · ANALYSIS · FEATURES</div>
          <span class="blog-card-read">Read article →</span>
        </div>
      </a>`).join('\n');

indexHtml = indexHtml.replace('<div class="blog-grid">', `<div class="blog-grid">\n${newCards}`);
fs.writeFileSync(indexPath, indexHtml);
console.log('Updated blog index');
