'use client'
import { useState } from "react";
import DocumentSection from "./LibraryCompo/DocumentSection";
import MediaSection from "./LibraryCompo/MediaSection";

const LibraryCompo = () => {
  const [documents] = useState([
    // {
    //   id: 1,
    //   title: "Responsive Navbar",
    //   preview: "```html <!DOCTYPE html> <html lang=\"en\"> <head>     <meta charset=\"UTF-8\">     <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">     <title>High Tech Consultancy</title>     <!-- Tailwind CSS CDN -->",
    //   date: "Feb 6",
    //   icon: "code"
    // },
    // {
    //   id: 2,
    //   title: "Admin Panel Simulation",
    //   preview: "```react import React, { useState } from 'react';  // --- MOCK DATA (Simulating what comes from MongoDB) --- const mockData = [   {     id: 1,     photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',     r",
    //   date: "Feb 6",
    //   icon: "code"
    // }
  ]);

  const [media] = useState([
    // { id: 1, src: "https://lh3.googleusercontent.com/gg/AMW1TPo93krNeonVh6SkCHco3CZ4WqZI6fDqlE-UB5eGaHkqd-KlHKSPk_TzOLi-c_Ne-8txLBhyjVSL0ojzx5GMdG3bD86txuxY8baWAxE3dh0dVC2U4Ba_sQWxdugRCdYtkH93OldJDsFqXyXAfJciWi4IGsMEawa_M9mNizVctsrWbUKy2zjeqouE6UqhiaLEwbhZrY75qesO316XgnrWxI3L4uDAFHS7zzh4rtMzhtd_l1ZflnnyDsNsC7yCkmrw3yt2xZojhIGbBIZ08YEiJkNmymiGNXITMRZRFg3ABmT8E_ZquJ5IkN_E5h1kqtXfHM241UHPf2vwLfoX7Pltz0g=w200-h200-n-v1-rj", type: "image" },
    // { id: 2, src: "https://lh3.googleusercontent.com/gg/AMW1TPoVzharoKRjnIwRJXqUTjL2r2-dH2DztbVSR1PfnphuX665t-MKBw1wuyWLSprBK7sr-sF7WmiKQIPy2P3IhzcyDvrQzxp2ViOyzxTS9Z51s4EjkyjimbfG3338l05DI5r5-fIlEkbtB-z7F_U7iVNpXmS9yktDx2WTSfah5BUOKIvmRTNK_w0wXabP2cDhcUL29btLvieQhDHTV4t5pylCx5C_mR9c6wRR-DONM9qxZ8ppkO2cGVxPDbSol_X0P-CmI8O9JKFwz2DnQsLUqmbkAaMskYlU60_V3EG-g5qLKYT5slT_EhjvIkBUEmZxjMqkSTgIpC3uEw8KMoLesYx3=w200-h200-n-v1-rj", type: "image" },
    // { id: 3, src: "https://lh3.googleusercontent.com/gg/AMW1TPpyAvBYYz83bveD6oKYrcGcsG2iSMPWF68VOuo-9H_eb2dG8i2tAni9SgC9m-yV84ZbTQwV9E4MPHvsBAFchekG5wCqs7P9hRB0WulMWBIgtlEQU1QkN06wyg7TWQAOhUMHM8JgsdVZx66jy_08uUvSG8nIzHxduLry1jnNZVrQvhWJOvKUXIOl4wxsmPte9CUhvkOlvH40mmi-6na5RTZzOSaml6-mklQumVKZVXg6ejXnpOhiERriKieaz24wTirmnJ5Q2ZkPZucIk_rtkewCvl6uU2ZglxBZ-EYiAV6LeaR-6k8itiIusDn5grQKy-bRj07ZJQyu2zqCLUB1jaEj=w200-h200-n-v1-rj", type: "image" },
    // { id: 4, src: "https://lh3.googleusercontent.com/gg/AMW1TPoz9WNbIQ3VioCzShjaAACi3cqUmQhUa2S83q-IjXfT1myXRmFg_7L_h4XC_roMfLkRiKB1ZQzs2wPcr2-zP89ic68J7Ez6mdJNFKX8h2LlnJDneJeEjOx_eonuddWQlXA95QY-y03KkWfOp3HYPMjM0_mt3LQS_mToyCgJ78l22gydlYNUeRW0sURy4WgDYdPCyrPcrXCZdJ0DtV6whr83iV4Cy0lreJQ33A39pwNWY6b_wSFo7Ozin2ad0ag7w-uh2TS0Twqu7ncQ7vREPQFR8j-5e5Q9owVnCjqHomCrvytA3C6Yvb074kue42ZnE35Tk1mUpTuNcev4hHo_YIzn=w200-h200-n-v1-rj", type: "image" },
    // { id: 5, src: "https://lh3.googleusercontent.com/gg/AMW1TPrTYLun9NZNrrSDr3auBitLu53Fr36VdylrhmaEi68CBnwQO133TscLWF6QWCoSU5sKe0gigumJ-mpk5ZmO4eeqVS9XRjrOVe3Zdgq5WVwdcdgBPMXtd-7ITLq6yWYNJ7q7WpfYdAuup_YJdCBzvWzmgreMXU5_9p2UVjbCfW3PiNAmVdrR-zN3UIQf5uNGubiJ94jKUlE3KQQy4DXjinFkv-d9MyIwSALaznyzUr7U7XmhV1-nr5Xnt-NpYN55eNhPKk72AW6hstZt9BcF9YV8BcnqXvmK2FMSZN7ZNIdGt97C5ii737mf0L9wWbe3tZbnIbhCuzpYAGTDFY4zA8F4=w200-h200-n-v1-rj", type: "image" },
    // { id: 6, src: "https://lh3.googleusercontent.com/gg/AMW1TPrbZRKQB6QLG5e7p_m1SSZT-qHHP2vJPXp5zi-JnTtS6QeqoJuAnIWvN_ZvkwTeyzAns4yeqxt9FQ83shVTXMuLejCrGYZPWkRei01bQsw5muBrgUPehLTYVaeiMxeW2XxfUhN1zfFpjWPiwPePZXy6i-S1UpGH8m3fANB3jpA-TY532YcVTzkRDke60PstvP8C-qvom_EURYwkaSeKXVHAPEHrJqd4-Krv4lhW4ZxdFQnj7hPMSRPWW7fYCzSkNwTNeQpxil3eqVCba7SgRDXno7huCaEgX4cBAhPkCuaiMiMwBBZUVldO4uN2Kadu4RP85iF-IPqGeSxXq84So-un=w200-h200-n-v1-rj", type: "image" },
    // { id: 7, src: "https://lh3.googleusercontent.com/gg/AMW1TPqhOppMoDxBQRkVEo2i-BNfZY9izxn1OVyMSR6eW745M0HBWPP0q2qo_c2k03MKHM2po-IitlfzXkOaF-FWiHY6ay09aQZLrV9F0xcxrb7XumixSUOqrK1_X6vwIa-O95u3hseJHH3hhMrEomdLrQuAv-vsAai2G637RzfXUpKGwZdWRvOVf_wcSx3DaZlVLPq9PcI6uEqlFa-VwaicHOjILg9ZN9aciqKX62Org87ufbpAResOr_MzaCLVDGonAGrMTHrvwqS7gFwoXqX2UcgbOvllMvPfRpM9YGyHMDK_PLJxuLU2hbrLLDFtKjmXDTScu0PXE0b7ApRLZ1kmE0qU=w200-h200-n-v1-rj", type: "image" },
    // { id: 8, src: "https://lh3.googleusercontent.com/gg/AMW1TPppp5jYgJ2SGuh5shQq-xP9XTKbHTgPVIHWRUA3xKyF2L3cpix6xfcPrn3qwCrsteefsxvugwyyuXFUcJiqGfIKm4uX9cbBTkLOfioM4wD5kvO7IyEAvSGGzMKXDYEwWYgKUxaFIF5XvRC8fuefYoUMnva9W_w3a2l4arRev82UYYu4gfMiwiQjWdA4pymvXtoAEOG6uMTK_XFtcAkHMvrHPgXwUkE4MKI9phH0gknau9VhiTnMc9n19J2z5JSzv0YtQ2Ea6efePefypvrTk7tPjZpdIqqSOLRU8FB4aRHL9ZhE4R2m7MHmvED5MLd1-xBosuGFiDPe-Tq7wMr1zI0Y=w200-h200-n-v1-rj", type: "image" },
    // { id: 9, src: "https://lh3.googleusercontent.com/gg/AMW1TPoA4onrd8whYk0y1AZtm796lfoKpCfamZ_nLxaT0bz-VM9VnnQ_1cVWNs9wq0ebSjcF0JU0aJTp8pAdAIcneJnLObzBwRW-VOn9yxZaXCacEzpMCJZtirRvHV7NB0WK3lzMTOy9wQW0iqx7dEO2W45RdMMBqyD9IDxRS_LrsnWasZMrdZ2tCtH9LM4SgjOMLDYJep1HuaZ__cYM0m-PYXmsM9joLvbBdwx8ZXwXt19AjX1kOAumOZX8JXf2aTNa9NYuZwW3MpdClLpM0SMttR5xiQ4IIjmo2-LuxJKMwf4je1vY3T7KWA4XwIKumtFNyqQtAspkAh52w8MH70CcmxA=w200-h200-n-v1-rj", type: "image" },
    // { id: 10, src: "https://lh3.googleusercontent.com/gg/AMW1TPqvVbLyTs2CgzQe8LWjoo-Ua67pGYe2d2SOi8I9x0MX7UhqhTJn1Gpi5_EcP6423GTy9-aQuOqsqrQUE1b8xyTi-0IhF59IAAHlfhUjWDf7fkv99xanMJh3llPUUGklw5ShtUWqmpWF7PopApqnRe8OZ0j0VnqwhUoh_Jgv8T1PD7PtUzVTn7da7IpRYwbYkH0j2vU7UoU7LP0l3MqaxCTyBKtxCf3uo0pVlQ3Lee1vC7LuTCfBRE5fcvFUKRrP6rAarab8JUYaD7FY98jjG7Oez7SA7CxTc0Nlv3kZsPmtDl_Zq99uVkIEa-XzpPss5_PsAPXpCnck6hEpDT6dMdAY=w200-h200-n-v1-rj", type: "video" },
  ]);

  return (
    <div className="w-full h-full overflow-y-auto py-6">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-normal text-text-primary mb-6 px-4">My stuff</h1>
        {documents.length === 0 && media.length === 0 ? (
          <p className="px-4 text-sm text-text-secondary">
            Organize and manage the documents and images you've uploaded to Airi.
          </p>
        ) : (
          <>
            {documents.length > 0 && <DocumentSection documents={documents} />}
            {media.length > 0 && <MediaSection media={media} />}
          </>
        )}
      </div>
    </div>
  );
};

export default LibraryCompo;
