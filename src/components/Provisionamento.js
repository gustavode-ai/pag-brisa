import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Provisionamento.css";
import { GrCopy } from "react-icons/gr";
import { FaCogs } from "react-icons/fa";

const Provisionamento = () => {
  const [tipo, setTipo] = useState("");
  const [linhaAntiga, setLinhaAntiga] = useState("");
  const [linhaNova, setLinhaNova] = useState("");
  const [imsiAntigo, setImsiAntigo] = useState("");
  const [imsiNovo, setImsiNovo] = useState("");
  const [fwaOuBrisanet, setFwaOuBrisanet] = useState("");
  const [comandos, setComandos] = useState([]);

  const handleTipoChange = (e) => {
    setTipo(e.target.value);
    setComandos([]); 
  };

  const gerarComandos = () => {
   
    const linhas = linhaAntiga.split("\n").filter((l) => l.trim() !== "");
    const imsis = imsiAntigo.split("\n").filter((i) => i.trim() !== "");
    if (
      (tipo === "troca de linha" && (!linhaAntiga || !linhaNova)) ||
      (tipo === "troca de chip" && (!imsiAntigo || !imsiNovo)) ||
      (tipo === "desbloqueio financeiro" && !linhaAntiga) ||
      (tipo === "provisionamento" &&
        (!linhaAntiga || !imsiAntigo || !fwaOuBrisanet))
    ) {
      toast.error("Por favor, preencha todos os campos necessários.", {
        autoClose: 2000,
        position: "bottom-left",
      });
      return;
    }
    if (
      (tipo === "provisionamento" || tipo === "troca de chip") &&
      !isSameLength(linhas, imsis)
    ) {
      toast.error("A quantidade de ISDNs e IMSIs deve ser a mesma.", {
        autoClose: 2000,
        position: "bottom-left",
      });
      return;
    }
    const linhasInvalidas = linhaAntiga
    .split("\n")
    .some((linha) => !isValidISDN(linha));
  if (linhasInvalidas) {
    toast.error(
      "Alguma linha ISDN é inválida. Deve conter 13 dígitos e começar com 55.",
      {
        autoClose: 2000,
        position: "bottom-left",
      }
    );
    return;
  }

  if ((tipo === "provisionamento" || tipo === "troca de chip") && imsis.some((imsi) => !isValidIMSI(imsi))) {
    toast.error(
      "Algum IMSI é inválido. Deve conter 15 dígitos e começar com 72477.",
      {
        autoClose: 2000,
        position: "bottom-left",
      }
    );
    return;
  }

    let tplsubComandos = [];
    let hhsssubComandos = [];
    let hbarComandos = [];
    let rmvSub = [];
    let volteSubComandos = [];

    
    if (tipo === "provisionamento") {
      const linhas = linhaAntiga.split("\n").filter((l) => l.trim() !== "");
      const imsis = imsiAntigo.split("\n").filter((i) => i.trim() !== "");
      const tplid = fwaOuBrisanet.toLowerCase() === "fwa" ? 5 : 4;

      linhas.forEach((linha, index) => {
        const imsi = imsis[index] || imsis[0]; 

        tplsubComandos.push(
          `ADD TPLSUB:HLRSN=1,IMSI="${imsi}",ISDN="${linha}",TPLTYPE=NORMAL,TPLID=${tplid};`
        );
        hhsssubComandos.push(
          `ADD HHSSSUB:SUBID="${linha}",IMPI="${imsi}@ims.mnc077.mcc724.3gppnetwork.org",IMPIAUTHTYPE=EAA,IMSI="${imsi}",IMPULIST="\\\"sip:+${linha}@ims.mnc077.mcc724.3gppnetwork.org\\\"&\\\"sip:${imsi}@ims.mnc077.mcc724.3gppnetwork.org\\\"&\\\"tel:+${linha}\\\"",ISDN="${linha}",CAPTPLID=1,CHARGTPLID=1,SPTPLID=1,IMPUTPLID=1,IRSID=1,ALIASID=1;`
        );
        hbarComandos.push(
          `SET HBAR: IMPU="sip:${imsi}@ims.mnc077.mcc724.3gppnetwork.org",BAR=TRUE;`
        );
        volteSubComandos.push(`AddVoLTESub:MSISDN="${linha}",CSP=20;`);
      });
    } else if (tipo === "troca de linha") {
      const linhasAntigas = linhaAntiga
        .split("\n")
        .filter((l) => l.trim() !== "");
      const linhasNovas = linhaNova.split("\n").filter((l) => l.trim() !== "");

      linhasAntigas.forEach((linhaAntiga, index) => {
        const linhaNova = linhasNovas[index] || linhasNovas[0]; 

        tplsubComandos.push(`RmvVoLTESub:MSISDN="${linhaAntiga}";`);
        hhsssubComandos.push(
          `MOD ISDN: ISDN="${linhaAntiga}", NEWISDN="${linhaNova}";`
        );
        hbarComandos.push(
          `MOD HHSSTN: ISDN="${linhaAntiga}", NEWISDN="${linhaNova}", IMPU="sip:+${linhaAntiga}@ims.mnc077.mcc724.3gppnetwork.org", NEWIMPU="sip:+${linhaNova}@ims.mnc077.mcc724.3gppnetwork.org", IMPU2="tel:+${linhaAntiga}", NEWIMPU2="tel:+${linhaNova}";`
        );
        volteSubComandos.push(`AddVoLTESub:MSISDN="${linhaNova}",CSP=20;`);
      });
    }

    
    else if (tipo === "troca de chip") {
      
      const imsisAntigos = imsiAntigo
        .split("\n")
        .filter((i) => i.trim() !== "");
      const imsisNovos = imsiNovo.split("\n").filter((i) => i.trim() !== "");

      
      imsisAntigos.forEach((imsiAntigo, index) => {
        const imsiNovo = imsisNovos[index] || imsisNovos[0]; // Usa o IMSI novo correspondente ou o primeiro

        tplsubComandos.push(
          `MOD IMSI: IMSI="${imsiAntigo}", NEWIMSI="${imsiNovo}";`
        );
        hhsssubComandos.push(
          `MOD HHSSIMSI: IMPI="${imsiAntigo}@ims.mnc077.mcc724.3gppnetwork.org", IMPU="sip:${imsiAntigo}@ims.mnc077.mcc724.3gppnetwork.org", NEWIMPI="${imsiNovo}@ims.mnc077.mcc724.3gppnetwork.org", NEWIMPIAUTHTYPE=EAA, IMSI="${imsiNovo}", NEWIMPU="sip:${imsiNovo}@ims.mnc077.mcc724.3gppnetwork.org";`
        );
      });
    }

    // Handling Desbloqueio Financeiro (linhaAntiga)
    else if (tipo === "desbloqueio financeiro") {
      // Filtra as linhas antigas
      const linhasAntigas = linhaAntiga
        .split("\n")
        .filter((l) => l.trim() !== "");

      // Itera pelas linhas antigas
      linhasAntigas.forEach((linhaAntiga) => {
        tplsubComandos.push(
          `MOD TPLOPTGPRS: ISDN="${linhaAntiga}",PROV=TRUE,TPLID=4;`
        );
        hhsssubComandos.push(
          `MOD TPLNGS: ISDN="${linhaAntiga}",NGCNODETPL_ID=1,NGSUSERTPLID=1;`
        );
        hbarComandos.push(
          `SND CANCELC:ISDN="${linhaAntiga}",DEST=ALL,CANCELTYPE=updateProcedure;`
        );
        rmvSub.push(`RmvVoLTESub:MSISDN="${linhaAntiga}";`);
        volteSubComandos.push(`AddVoLTESub:MSISDN="${linhaAntiga}",CSP=20;`);
      });
    }

    // Set commands for display
    setComandos(
      [
        tplsubComandos.join("\n"),
        hhsssubComandos.join("\n"),
        hbarComandos.join("\n"),
        rmvSub.join("\n"),
        volteSubComandos.join("\n"),
      ].filter((c) => c.trim() !== "")
    );

    toast.success("Comandos gerados com sucesso!", {
      autoClose: 2000,
      position: "bottom-left",
    });
  };
  const isSameLength = (linhas, imsis) => {
    return linhas.length === imsis.length;
  };

  const isValidIMSI = (imsi) => {
    return /^\d{15}$/.test(imsi) && imsi.startsWith("72477");
  };

  const isValidISDN = (linha) => {
    return /^\d{13}$/.test(linha) && linha.startsWith("55");
  };

  const copiarComando = (comando) => {
    navigator.clipboard
      .writeText(comando)
      .then(() => {
        toast.success("Comando copiado para a área de transferência!", {
          autoClose: 2000,
          position: "bottom-left",
        });
      })
      .catch((err) => {
        toast.error("Erro ao copiar o comando: " + err, {
          autoClose: 2000,
          position: "bottom-left",
        });
      });
  };

  return (
    <>
      <div className="prov-container">
        <h1 className="h1">Provisionamento</h1>
        <div>
          <label className="label">Tipo de Provisionamento:</label>
          <select className="select" value={tipo} onChange={handleTipoChange}>
            <option value="">Selecione</option>
            <option value="provisionamento">Provisionamento</option>
            <option value="troca de linha">Troca de Linha</option>
            <option value="troca de chip">Troca de Chip</option>
            <option value="desbloqueio financeiro">
              Desbloqueio Financeiro
            </option>
          </select>
        </div>

        {/* Condicionais para exibir inputs */}
        {tipo === "provisionamento" && (
          <>
            <div>
              <label className="label">ISDN:</label>
              <textarea
                className="input"
                value={linhaAntiga}
                onChange={(e) => setLinhaAntiga(e.target.value)}
              />
            </div>
            <div>
              <label className="label">IMSI:</label>
              <textarea
                className="input"
                value={imsiAntigo}
                onChange={(e) => setImsiAntigo(e.target.value)}
              />
            </div>
            <div>
              <label className="label">FWA ou Brisanet:</label>
              <input
                className="input"
                type="text"
                value={fwaOuBrisanet}
                onChange={(e) => setFwaOuBrisanet(e.target.value)}
                style={{height:'42px'}}
              />
            </div>
          </>
        )}

        {tipo === "troca de linha" && (
          <>
            <div>
              <label className="label">ISDN Antigo:</label>
              <textarea
                className="input"
                value={linhaAntiga}
                onChange={(e) => setLinhaAntiga(e.target.value)}
              />
            </div>
            <div>
              <label className="label">ISDN Novo:</label>
              <textarea
                className="input"
                value={linhaNova}
                onChange={(e) => setLinhaNova(e.target.value)}
              />
            </div>
          </>
        )}

        {tipo === "troca de chip" && (
          <>
            <div>
              <label className="label">IMSI Antigo:</label>
              <textarea
                className="input"
                value={imsiAntigo}
                onChange={(e) => setImsiAntigo(e.target.value)}
              />
            </div>
            <div>
              <label className="label">IMSI Novo:</label>
              <textarea
                className="input"
                value={imsiNovo}
                onChange={(e) => setImsiNovo(e.target.value)}
              />
            </div>
          </>
        )}

        {tipo === "desbloqueio financeiro" && (
          <div>
            <label className="label">ISDN:</label>
            <textarea
              className="input"
              value={linhaAntiga}
              onChange={(e) => setLinhaAntiga(e.target.value)}
              tipe="number"
            />
          </div>
        )}

        <button
          className="button"
          onClick={gerarComandos}
          aria-label="Gerar comandos"
          disabled={tipo === ""}
          style={{
            cursor: tipo === "" ? "not-allowed" : "pointer",
            opacity: tipo === "" ? 0.5 : 1,  marginLeft: '50%',
            transform: 'translate(-50%)'
          }}
        >
          <FaCogs className="icon" /> Gerar comandos
        </button>
      </div>

      <div className="prov-container2">
        <h2>Comandos Gerados:</h2>
        {comandos.length > 0 &&
          comandos.map((comando, index) => (
            <div key={index}>
              <textarea className="textarea" value={comando} readOnly />
              <button
                className="button"
                onClick={() => copiarComando(comando)}
                aria-label="Copiar comando"
              >
                <GrCopy className="icon" />
              </button>
            </div>
          ))}
      </div>

      <ToastContainer />
    </>
  );
};

export default Provisionamento;
