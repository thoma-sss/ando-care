# Configuration de la base de données

## Option recommandée : Neon (PostgreSQL gratuit)

1. Créez un compte sur https://neon.tech (gratuit)
2. Créez un nouveau projet
3. Copiez la **Connection string** (format: `postgresql://user:password@host/database?sslmode=require`)
4. Mettez à jour votre `.env.local` :

```bash
DATABASE_URL="postgresql://votre_user:votre_password@votre_host.neon.tech/neondb?sslmode=require"
```

5. Exécutez les migrations :

```bash
npx prisma db push
```

6. Redémarrez le serveur :

```bash
npm run dev
```

## Alternative : PostgreSQL local

Si vous avez PostgreSQL installé :

```bash
# macOS avec Homebrew
brew install postgresql@15
brew services start postgresql@15

# Créer la base de données
createdb ando

# Mettre à jour .env.local
DATABASE_URL="postgresql://localhost:5432/ando"

# Appliquer le schéma
npx prisma db push
```

## Variables d'environnement requises

Créez un fichier `.env.local` avec :

```bash
# Database (OBLIGATOIRE)
DATABASE_URL="postgresql://..."

# Strava OAuth (obtenir sur https://www.strava.com/settings/api)
STRAVA_CLIENT_ID=votre_client_id
STRAVA_CLIENT_SECRET=votre_client_secret
STRAVA_VERIFY_TOKEN=une_chaine_aleatoire

# App
APP_BASE_URL=http://localhost:3000
APP_ENCRYPTION_KEY=dGVzdGluZy1lbmNyeXB0aW9uLWtleS1iYXNlNjQ=
```

## Vérifier la connexion

```bash
npx prisma studio
```

Cela ouvrira une interface web pour visualiser votre base de données.

