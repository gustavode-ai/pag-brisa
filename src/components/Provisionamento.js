import React, { useState } from "react";
import "./Provisionamento.css"

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
    if (
      (tipo === "troca de linha" && (!linhaAntiga || !linhaNova)) ||
      (tipo === "troca de chip" && (!imsiAntigo || !imsiNovo)) ||
      (tipo === "desbloqueio financeiro" && !linhaAntiga) ||
      (tipo === "provisionamento" && (!linhaAntiga || !imsiAntigo || !fwaOuBrisanet))
    ) {
      alert("Por favor, preencha todos os campos necessários.");
      return;
    }

    let novosComandos = [];

    if (tipo === "provisionamento") {
      const tplid = fwaOuBrisanet.toLowerCase() === "fwa" ? 5 : 4;
      novosComandos = [
        `ADD TPLSUB:HLRSN=1,IMSI=\"${imsiAntigo}\",ISDN=\"${linhaAntiga}\",TPLTYPE=NORMAL,TPLID=${tplid};`,
        `ADD HHSSSUB:SUBID=\"${linhaAntiga}\",IMPI=\"${imsiAntigo}@ims.mnc077.mcc724.3gppnetwork.org\",IMPIAUTHTYPE=EAA,IMSI=\"${imsiAntigo}\",IMPULIST=\"\\\"sip:+${linhaAntiga}@ims.mnc077.mcc724.3gppnetwork.org\\\"&\\\"sip:${imsiAntigo}@ims.mnc077.mcc724.3gppnetwork.org\\\"&\\\"tel:+${linhaAntiga}\\\"\",ISDN=\"${linhaAntiga}\",CAPTPLID=1,CHARGTPLID=1,SPTPLID=1,IMPUTPLID=1,IRSID=1,ALIASID=1;`,
        `SET HBAR: IMPU=\"sip:${imsiAntigo}@ims.mnc077.mcc724.3gppnetwork.org\",BAR=TRUE;`,
        `AddVoLTESub:MSISDN=\"${linhaAntiga}\",CSP=20;`
      ];
    } else if (tipo === "troca de linha") {
      novosComandos = [`RmvVoLTESub:MSISDN="${linhaAntiga}";`,
        `MOD ISDN: ISDN="${linhaAntiga}", NEWISDN="${linhaNova}";`,
        `MOD HHSSTN: ISDN="${linhaAntiga}", NEWISDN="${linhaNova}", IMPU="sip:+${linhaAntiga}@ims.mnc077.mcc724.3gppnetwork.org", NEWIMPU="sip:+${linhaNova}@ims.mnc077.mcc724.3gppnetwork.org", IMPU2="tel:+${linhaAntiga}", NEWIMPU2="tel:+${linhaNova}";`,
        `AddVoLTESub:MSISDN="${linhaNova}",CSP=20;`
      ];
    } else if (tipo === "troca de chip") {
      novosComandos = [`MOD IMSI: IMSI="${imsiAntigo}", NEWIMSI="${imsiNovo}";`,
        `MOD HHSSIMSI: IMPI="${linhaAntiga}@ims.mnc077.mcc724.3gppnetwork.org", IMPU="sip:${linhaAntiga}@ims.mnc077.mcc724.3gppnetwork.org", NEWIMPI="${imsiNovo}@ims.mnc077.mcc724.3gppnetwork.org", NEWIMPIAUTHTYPE=EAA, IMSI="${imsiNovo}", NEWIMPU="sip:${imsiNovo}@ims.mnc077.mcc724.3gppnetwork.org";`
      ];
    } else if (tipo === "desbloqueio financeiro") {
      novosComandos = [`MOD TPLOPTGPRS: ISDN="${linhaAntiga}",PROV=TRUE,TPLID=4;`,
        `MOD TPLNGS: ISDN="${linhaAntiga}",NGCNODETPL_ID=1,NGSUSERTPLID=1;`,
        `SND CANCELC:ISDN="${linhaAntiga}",DEST=ALL,CANCELTYPE=updateProcedure;`,
        `RmvVoLTESub:MSISDN="${linhaAntiga}";`,
        `AddVoLTESub:MSISDN="${linhaAntiga}",CSP=20`
      ];
    }

    setComandos(novosComandos);
  };

  const copiarComando = (comando) => {
    navigator.clipboard
      .writeText(comando)
      .then(() => {
        alert("Comando copiado para a área de transferência!");
      })
      .catch((err) => {
        alert("Erro ao copiar o comando: " + err);
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
          <option value="desbloqueio financeiro">Desbloqueio Financeiro</option>
        </select>
      </div>

      {tipo === "provisionamento" && (
        <>
          <div>
            <label className="label">ISDN:</label>
            <input
              className="input"
              type="number"
              value={linhaAntiga}
              onChange={(e) => setLinhaAntiga(e.target.value)}
            />
          </div>
          <div>
            <label className="label">IMSI:</label>
            <input
            className="input"
              type="number"
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
            />
          </div>
        </>
      )}

      {tipo === "troca de linha" && (
        <>
          <div>
            <label className="label">ISDN Antigo:</label>
            <input
            className="input"
              type="number"
              value={linhaAntiga}
              onChange={(e) => setLinhaAntiga(e.target.value)}
            />
          </div>
          <div>
            <label className="label">ISDN Novo:</label>
            <input
            className="input"
              type="number"
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
            <input
            className="input"
              type="number"
              value={imsiAntigo}
              onChange={(e) => setImsiAntigo(e.target.value)}
            />
          </div>
          <div>
            <label className="label">IMSI Novo:</label>
            <input
            className="input"
              type="number"
              value={imsiNovo}
              onChange={(e) => setImsiNovo(e.target.value)}
            />
          </div>
        </>
      )}

      {tipo === "desbloqueio financeiro" && (
        <div>
          <label className="label">ISDN:</label>
          <input
          className="input"
            type="number"
            value={linhaAntiga}
            onChange={(e) => setLinhaAntiga(e.target.value)}
          />
        </div>
      )}

      <button className="button" onClick={gerarComandos}>Gerar Comandos</button>

      
    </div>
      
    <div className="prov-container">
    <h2>Comandos Gerados:</h2>
    {comandos.length > 0 ? (
      comandos.map((comando, index) => (
        <div
          key={index}a
          style={{
            marginBottom: "10px",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <textarea
          className="textarea"
            value={comando}
            readOnly
            rows={4}
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <button className="button" onClick={() => copiarComando(comando)}>
            Copiar Comando
          </button>
        </div>
      ))
    ) : (
      <p>Nenhum comando gerado.</p>
    )}
  </div>
  </>
  );
};

export default Provisionamento;
