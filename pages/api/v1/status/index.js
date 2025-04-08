import database from "infra/database.js";
import { Client } from "pg";

async function status(request, response) {
  const updateAt = new Date().toISOString();
  const databaseName = process.env.POSTGRES_DB;
  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;
  const databaseMaxConnectionsResult = await database.query("SHOW max_connections;");
  const databaseMaxConnectionsValue = databaseMaxConnectionsResult.rows[0].max_connections;

  const databaseOpenedConnectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName]
  }) // SELECT = Selecione / * = tudo que esta aq / FROM = from, daqui / WHERE = Onde, essa ... / count() = uma funcao que retorna apenas o numero de linhas / ::int = ele faz com que o retorna seja covertido pra um numero inteiro
  
  const databaseOpenedConnectionsValue = databaseOpenedConnectionsResult.rows[0].count;
  response.status(200).json({
    update_at: updateAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: databaseOpenedConnectionsValue,
      }
    }
  });

}

export default status;