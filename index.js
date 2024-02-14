const express = require("express");
const req = require("express/lib/request");
const { google } = require("googleapis");

const app = express();
app.use(express.json());

async function getAuthSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({
    version: "v4",
    auth: client,
  });

  const spreadsheetId = "1rONJMZ9zT8NXa7TaB2Oo0W3hzVgJWTtxiggHXmt8X7Y";

  return {
    auth,
    client,
    googleSheets,
    spreadsheetId,
  };
}

app.get("/getNotas", async (req, res) => {
  try {
    // Autenticar e obter acesso à planilha
    const { auth, googleSheets, spreadsheetId } = await getAuthSheets();

    //Pega a quantidade de linhas
    const getTotalRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "engenharia_de_software!A:A",
    });

    const totalClass = 60;

    let totalrows = getTotalRows.data.values.length;

    // Verifica se tem linhas na planilha
    if (totalrows != null && totalrows > 0) {
      totalrows = totalrows - 3; // Remove as 3 primeiras linhas, para pegar apenas as dos alunos

      // Busca as notas e as faltas de cada aluno
      for (let index = 0; index < totalrows; index++) {
        const getGrades = await googleSheets.spreadsheets.values.get({
          auth,
          spreadsheetId,
          range: `engenharia_de_software!C${index + 4}:F${index + 4}`, // Especifique o intervalo onde estão as notas na planilha
        });

        const grades = getGrades.data.values[0]; // Todas as notas
        let totalGrade = parseInt(grades[1]) + parseInt(grades[2]) + parseInt(grades[3]); // Nota total
        let skipClass = parseInt(grades[0]); // Faltas total
        let media = Math.ceil(totalGrade / 3); // Media de notas
        let ranges = [`engenharia_de_software!G${index + 4}`];
        let studentValues = []
        let hasMoreParameters = false

        // Lógica para verificar o status dos alunos
        if (skipClass > (totalClass * 0.25)) {
          studentValues = [['Reprovado por Falta']]
        } else if (media < 50) {
          studentValues = [['Reprovado']]
        }
        else if (media > 70) {
          studentValues = [['Aprovado']]
        } else {
          let naf = 100 - media;
          ranges = [`engenharia_de_software!G${index + 4}`, `engenharia_de_software!H${index + 4}`]
          studentValues = [['Exame Final'], [naf]]
          hasMoreParameters = true
        }

        if (hasMoreParameters) {
          // Se tiver mais de um parâmetro ubatchUpdate
          googleSheets.spreadsheets.values.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: {
              valueInputOption: 'RAW',
              data: ranges.map((range, i) => ({
                range: range,
                values: [studentValues[i]],
              })),
            },
          });
        } else { // Se não tiver, usa o update
          let request = {
            spreadsheetId: spreadsheetId,
            range: ranges,
            valueInputOption: 'RAW',
            resource: { values: studentValues },
          };

          googleSheets.spreadsheets.values.update(request, (err, response) => {
            if (err) {
              console.error('Erro ao atualizar valores:', err);
              return;
            }
            console.log('Valores atualizados com sucesso:', response.data);
          });
        }

      }
    }

    res.status(200).send("Status dos alunos atualizado!");
  } catch (error) {
    console.log('error - ', error);
    res.status(500).send("Ops, algo deu errado");
  }
});

app.listen(3001, () => console.log("Rodando na porta 3001"));
