import { Client, Databases, Permission, Role } from "node-appwrite";

const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("69bb4ab80007eaf643ad")
  .setKey("standard_63387cf3a0075c38537166adf2a108e3414b665cbd60113c2dedeb464087d8e54871bd6a564d76652dd672ce56f92ff2bd5e457fccad62091ab349d76585c13bbceccd058675758dd7bd72dd7abf8706e9217de73a0318f7b6cff35bfc65a991342eeef1d8846239cadcebeeeef1f7591039de8c1f3e62e990b8bd961efb4ac1");

const db = new Databases(client);
const DATABASE_ID = "69bb4b6200165ff03610";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function createCollection(id, name, attributes) {
  console.log(`\n→ Creating collection: ${name}`);
  try {
    await db.createCollection(DATABASE_ID, id, name, [
      Permission.read(Role.any()),
      Permission.create(Role.any()),
    ]);
    console.log(`  ✓ Collection created`);
  } catch (e) {
    if (e.code === 409) {
      console.log(`  ↩ Already exists, skipping`);
    } else {
      console.error(`  ✗ Error:`, e.message);
      return;
    }
  }

  for (const attr of attributes) {
    await wait(600);
    try {
      if (attr.type === "string") {
        await db.createStringAttribute(DATABASE_ID, id, attr.key, attr.size || 255, attr.required || false, attr.default || null);
      } else if (attr.type === "email") {
        await db.createEmailAttribute(DATABASE_ID, id, attr.key, attr.required || false, attr.default || null);
      } else if (attr.type === "boolean") {
        await db.createBooleanAttribute(DATABASE_ID, id, attr.key, attr.required || false, attr.default || false);
      } else if (attr.type === "double") {
        await db.createFloatAttribute(DATABASE_ID, id, attr.key, attr.required || false, null, null, attr.default || null);
      } else if (attr.type === "datetime") {
        await db.createDatetimeAttribute(DATABASE_ID, id, attr.key, attr.required || false, attr.default || null);
      }
      console.log(`  ✓ attr: ${attr.key}`);
    } catch (e) {
      if (e.code === 409) {
        console.log(`  ↩ attr exists: ${attr.key}`);
      } else {
        console.error(`  ✗ attr failed (${attr.key}):`, e.message);
      }
    }
  }
}

async function main() {
  console.log("DPDPA Appwrite Setup");
  console.log("====================");

  await createCollection("leads", "Consultation Leads", [
    { key: "name",             type: "string",   size: 255, required: true  },
    { key: "email",            type: "email",                required: true  },
    { key: "phone",            type: "string",   size: 50,  required: false },
    { key: "company",          type: "string",   size: 255, required: true  },
    { key: "industry",         type: "string",   size: 100, required: false },
    { key: "company_size",     type: "string",   size: 50,  required: false },
    { key: "source",           type: "string",   size: 100, required: true  },
    { key: "issue_summary",    type: "string",   size: 5000,required: false },
    { key: "preferred_contact",type: "string",   size: 50,  required: false },
    { key: "preferred_time",   type: "string",   size: 100, required: false },
    { key: "consent_version",  type: "string",   size: 20,  required: false },
    { key: "risk_level",       type: "string",   size: 20,  required: false },
    { key: "created_at",       type: "datetime",             required: false },
  ]);

  await createCollection("subscribers", "Newsletter Subscribers", [
    { key: "name",            type: "string",  size: 255, required: true  },
    { key: "email",           type: "email",               required: true  },
    { key: "industry",        type: "string",  size: 100, required: false },
    { key: "frequency",       type: "string",  size: 20,  required: false },
    { key: "consent_version", type: "string",  size: 20,  required: false },
    { key: "user_agent",      type: "string",  size: 500, required: false },
    { key: "created_at",      type: "datetime",            required: false },
  ]);

  await createCollection("downloads", "White Paper Downloads", [
    { key: "name",             type: "string",  size: 255, required: true  },
    { key: "email",            type: "email",               required: true  },
    { key: "company",          type: "string",  size: 255, required: true  },
    { key: "industry",         type: "string",  size: 100, required: false },
    { key: "company_size",     type: "string",  size: 50,  required: false },
    { key: "consent_email",    type: "boolean",             required: false },
    { key: "consent_phone",    type: "boolean",             required: false },
    { key: "consent_webinars", type: "boolean",             required: false },
    { key: "privacy_version",  type: "string",  size: 20,  required: false },
    { key: "downloaded_at",    type: "datetime",            required: false },
  ]);

  await createCollection("assessments", "Assessment Results", [
    { key: "email",               type: "email",              required: true  },
    { key: "industry",            type: "string", size: 100,  required: true  },
    { key: "risk_level",          type: "string", size: 20,   required: true  },
    { key: "applicability_score", type: "double",             required: false },
    { key: "maturity_score",      type: "double",             required: false },
    { key: "risk_score",          type: "double",             required: false },
    { key: "urgency_score",       type: "double",             required: false },
    { key: "overall_score",       type: "double",             required: false },
    { key: "created_at",          type: "datetime",           required: false },
  ]);

  console.log("\n✅ Setup complete. Collections are ready in Appwrite.");
}

main().catch(console.error);
