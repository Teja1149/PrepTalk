import { useEffect } from "react";

export default function PalettePicker() {
  useEffect(() => {
    // ensure default theme
    if (!document.documentElement.dataset.theme) document.documentElement.dataset.theme = "default";
  }, []);

  const setTheme = (t) => {
    if (t === 'default') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.dataset.theme = t;
  };

  return (
    <div className="flex items-center gap-2">
      <button aria-label="Default" onClick={() => setTheme('default')} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-primary-600 border" />
      <button aria-label="Teal" onClick={() => setTheme('alt1')} className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-300 to-primary-500 border" />
      <button aria-label="Warm" onClick={() => setTheme('alt2')} className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary-400 border" />
    </div>
  );
}
