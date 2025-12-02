## Getting Started

Aplikacja umożliwia użytkownikom dodawanie znaczników wskazujących miejsca, w których znajdują się śmieci do zebrania, oraz lokalizacji służących do ich poprawnego wyrzucenia (przykładowe znaczniki są zrobione w naszej miejscowości w Gorzycach na Podkarpaciu). W przyszłości planowane jest także wprowadzenie systemu nagród — użytkownicy mogliby zdobywać punkty za zbieranie odpadów, a następnie wymieniać je na kody rabatowe do sklepów.
Obecnie mapa pełni funkcję poglądową i nie odzwierciedla jeszcze rzeczywistych lokalizacji odpadów.

Klucze do api czy bazy danych są juz w projekcie, więc powinny działać

Aby uruchomić projekt lokalnie,należy pobrać aplikacje expo na telefon i ze skanować kod QR albo na komputerze użyć emulatora android.

Otwierając projekt poprzez web nie będzie działać poprawnie, dlatego odsyłam do drugiej aplikacji, zrobionej specjalnie pod web https://github.com/JuanPablo033/smietnisko

wykonaj poniższe kroki:

1. Sklonuj repozytorium:
```bash
git clone https://github.com/MichalAniol258/my-smieciarz.git
cd my-smieciarz
```
2. Zainstaluj zależności:
```bash
npm install --legacy-peer-deps
# lub
yarn install --legacy-peer-deps
```
3. Uruchom projekt:
```bash
npx expo start
# lub
expo start
```
