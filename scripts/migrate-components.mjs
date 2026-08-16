import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('./components');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('next/link')) {
    content = content.replace(/import Link from ["']next\/link["'];?/g, 'import { Link } from "react-router-dom";');
    // carefully replace <Link href= with <Link to=
    content = content.replace(/<Link([^>]*)href=/g, '<Link$1to=');
    changed = true;
  }
  
  if (content.includes('next/navigation')) {
    content = content.replace(/import \{.*?\} from ["']next\/navigation["'];?/g, 'import { useNavigate, useLocation, useSearchParams, useParams } from "react-router-dom";');
    content = content.replace(/useRouter\(\)/g, 'useNavigate()');
    content = content.replace(/usePathname\(\)/g, '(useLocation().pathname)');
    changed = true;
  }

  if (content.includes('next/image')) {
    content = content.replace(/import Image from ["']next\/image["'];?/g, '');
    content = content.replace(/<Image\b/g, '<img');
    content = content.replace(/<\/Image>/g, '');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
