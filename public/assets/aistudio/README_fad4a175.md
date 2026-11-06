# BotExtended

<!-- Shrink 25x15
Expand 50x30 -->

This script adds a wide variety of bots and weapons to spice up combat experience. It is currently
under development.

## Features

- **Large variety of bots**: With [**100+ new bots**](#bots), including [**50+ bosses**](#bosses), you don't have to fight hard and expert bots all the time anymore.
- **New bot factions:** Bots are usually spawned in a group called faction. There are currently [**30+ factions**](./docs/FACTIONS.md) - Thug, Police, Soldier, Assassin, Zombie...
- **Bosses with special abilities:** Many bosses have **[special abilities]** and **[unique weapons][custom weapons]** to ramp up the challenge if you are getting bored of winning the vanilla bots.
- **Special weapons and powerups**: There are [**40+ gun powerups**](./docs/POWERUPS_RANGED.md) and [**10+ melee powerups**](./docs/POWERUPS_MELEE.md) for you to choose from to inflict maximum destruction on the enemies.
  <!-- - **Custom weapons:** LaserSweeper, Traps, Chickens. -->
  <!-- - **Reaction with dialogue:** Bots can have dialogues depend on the context and evironment around it -->

## Getting Started

- Install Python 3 if you don't have it on your computer.
- Clone this repository.
- Copy [this file](src/BotExtended/BotExtended.txt) and move it to `%USERPROFILE%\Documents\Superfighters Deluxe\Scripts\`
- Open your terminal, go to the root directory and run the following command:

```bash
cd scripts/xnbcli
npm install
cd ../..
python scripts/setup_script.py "C:\Program Files (x86)\Steam\steamapps\common\Superfighters Deluxe"
```

## Melee Powerups

[Docs](./docs/POWERUPS_MELEE.md) | [Demo](https://www.youtube.com/watch?v=T2NpStBZopU&list=PLNgAmHQnqv_m_OphnuEWAXsZjp1mvrEul)

## Ranged Powerups

[Docs](./docs/POWERUPS_RANGED.md) | [Demo](https://www.youtube.com/watch?v=T2NpStBZopU&list=PLNgAmHQnqv_m_OphnuEWAXsZjp1mvrEul)

## Custom Weapons

[Docs](./docs/CUSTOM_WEAPONS.md) | [Demo](https://www.youtube.com/watch?v=8id_mqD-9EI&list=PLNgAmHQnqv_neDehA2uAENMws0WBDx18k)

## Factions

See the full list of all factions [here](./docs/FACTIONS.md).

## Bots

### Assassin Melee

<div>
  <img src='./docs/Images/Assassin_1.png' />
  <img src='./docs/Images/Assassin_2.png' />
  <img src='./docs/Images/Assassin_3.png' />
  <img src='./docs/Images/Assassin_4.png' />
  <img src='./docs/Images/Assassin_5.png' />
  <img src='./docs/Images/Assassin_6.png' />
</div>

**Stats**

| **Health**    | Below Normal                                                                                                        |
| :------------ | :------------------------------------------------------------------------------------------------------------------ |
| **Speed**     | Very Fast                                                                                                           |
| **AI**        | Jogger + Melee Hard                                                                                                 |
| **Weapons**   | ![katana]                                                                                                           |
| **Factions**  | [Assassin][fassassin]                                                                                               |
| **Abilities** | All assassins in a team target one specific enemy at a time. The targeted player has an indicator above their head. |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

<div>
  <img src='https://media.giphy.com/media/upqjNAgyt6b6g3urvT/giphy.gif' width=500>
</div>

### Assassin Range

They are the same as [Assassin Melee](#Assassin-Melee) except for the following stats:

**Stats**

| **AI**      | Jogger + Range Hard |
| :---------- | :------------------ |
| **Weapons** | ![uzi]              |

### Agent

<div>
  <img src='./docs/Images/Agent_1.png' />
  <img src='./docs/Images/Agent_2.png' />
</div>

**Stats**

| **Health**       | Below Normal                            |
| :--------------- | :-------------------------------------- |
| **AI**           | Hard                                    |
| **Search Items** | Secondary                               |
| **Factions**     | [Agent][fagent], [MetroCop][fmetrocop]. |

**Weapons**

| Gears                    | Powerup  |
| :----------------------- | :------- |
| ![pistol]                | [Poison] |
| ![pistol] ![Lazer]       | [Poison] |
| ![baton]                 |          |
| ![ShockBaton]            |          |
| ![Magnum] ![Lazer]       | [Poison] |
| ![baton] ![Uzi] ![Lazer] | [Poison] |
| ![DarkShotgun] ![Lazer]  | [Poison] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

### Bandido

<div>
  <img src='./docs/Images/Bandido_1.png' />
  <img src='./docs/Images/Bandido_2.png' />
  <img src='./docs/Images/Bandido_3.png' />
  <img src='./docs/Images/Bandido_4.png' />
  <img src='./docs/Images/Bandido_5.png' />
  <img src='./docs/Images/Bandido_6.png' />
  <img src='./docs/Images/Bandido_7.png' />
</div>

**Stats**

| **Health**        | Below Normal                                                                     |
| :---------------- | :------------------------------------------------------------------------------- |
| **AI**            | Cowboy                                                                           |
| **Infinite Ammo** | True                                                                             |
| **Factions**      | [Bandido][fbandido], [Cowboy][fcowboy].                                          |
| **Abilities**     | Spawns an ammo stash on death that shoots 500 stray bullets in random direction. |

**Weapons**

| Gears                           | Powerup |
| :------------------------------ | :------ |
| ![machete] ![revolver]          |         |
| ![knife] ![carbine] ![revolver] |         |
| ![knife] ![shotgun] ![pistol]   |         |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

<div>
  <img src='https://media.giphy.com/media/WIMxBCxrS9ogrzzY4s/giphy.gif' width=500>
</div>

### Biker

<div>
  <img src='./docs/Images/Biker_1.png' />
  <img src='./docs/Images/Biker_2.png' />
  <img src='./docs/Images/Biker_3.png' />
  <img src='./docs/Images/Biker_4.png' />
  <img src='./docs/Images/Biker_5.png' />
  <img src='./docs/Images/Biker_6.png' />
  <img src='./docs/Images/Biker_7.png' />
  <img src='./docs/Images/Biker_8.png' />
  <img src='./docs/Images/Biker_9.png' />
  <img src='./docs/Images/Biker_10.png' />
  <img src='./docs/Images/Biker_11.png' />
  <img src='./docs/Images/Biker_12.png' />
</div>

**Stats**

| **Health**    | Below Normal                                                                                                                                                                                            |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **AI**        | Grunt                                                                                                                                                                                                   |
| **Weapons**   | ![leadpipe] ![chain] ![knife]                                                                                                                                                                           |
| **Factions**  | [Biker][fbiker], [Punk][fpunk], [Thug][fthug].                                                                                                                                                          |
| **Abilities** | <li>Has a gather spot, the gather spot is changed every 42 seconds.</li><li>Gains 4 health after dealing melee damage.</li><li>Has 3% chance of stealing an enemy's weapon after a successful hit.</li> |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

<!-- GIF: show gather spot -->

### Biker Hulk

Same profiles as [Biker].

**Stats**

| **Health**    | Strong                                  |
| :------------ | :-------------------------------------- |
| **Speed**     | Slow                                    |
| **AI**        | Hulk                                    |
| **Factions**  | [Biker][fbiker], [Stripper][fstripper]. |
| **Abilities** | Same as [Biker].                        |

**Weapons**

| Gears   | Powerup    |
| :------ | :--------- |
| ![fist] | [Breaking] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Very Low     |
| **Melee Damage Dealt**      | Above Normal |
| **Melee Force**             | Strong       |
| **Size**                    | Very Big     |

</details>

### Bodyguard

<div>
  <img src='./docs/Images/Bodyguard.png' />
</div>

**Stats**

| **Health**   | Below Normal                                |
| :----------- | :------------------------------------------ |
| **AI**       | Grunt                                       |
| **Weapons**  | ![pistol]                                   |
| **Factions** | [Stripper][fstripper], [Kingpin][fkingpin]. |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

### Bodyguard 2

Same as [Bodyguard] except for the following stats:

**Stats**

| **Weapons**  | ![tommygun]         |
| :----------- | :------------------ |
| **Factions** | [Kingpin][fkingpin] |

### Clown Bodyguard

<div>
  <img src='./docs/Images/ClownBodyguard_1.png' />
  <img src='./docs/Images/ClownBodyguard_2.png' />
  <img src='./docs/Images/ClownBodyguard_3.png' />
  <img src='./docs/Images/ClownBodyguard_4.png' />
</div>

**Stats**

| **Health**   | Below Normal                     |
| :----------- | :------------------------------- |
| **AI**       | Grunt                            |
| **Weapons**  | ![Katana] ![Knife] ![Axe] ![Bat] |
| **Factions** | [Clown][fclown]                  |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

### Clown Boxer

<div>
  <img src='./docs/Images/ClownBoxer.png' />
</div>

**Stats**

| **Health**   | Above Normal    |
| :----------- | :-------------- |
| **AI**       | Hulk            |
| **Factions** | [Clown][fclown] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Very Low     |
| **Melee Damage Dealt**      | Above Normal |
| **Melee Force**             | Strong       |
| **Size**                    | Very Big     |

</details>

### Clown Cowboy

<div>
  <img src='./docs/Images/ClownCowboy.png' />
</div>

**Stats**

| **Health**    | Below Normal                                                                                                                                                                   |
| :------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Speed**     | Above Normal                                                                                                                                                                   |
| **AI**        | Cowboy                                                                                                                                                                         |
| **Factions**  | [Clown][fclown]                                                                                                                                                                |
| **Abilities** | <li>Has 15% chance of disarming the enemy's weapon after a successful shot.</li><li>Has 1% chance of disarming and destroying the enemy's weapon after a successful shot.</li> |

**Weapons**

| Gears       | Powerup |
| :---------- | :------ |
| ![Revolver] | [Blast] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Above Normal |
| **Melee Damage Dealt**      | Fairly Low   |
| **Size**                    | Small        |

</details>

<!-- GIF: show cowboy disarming -->

### Clown Gangster

<div>
  <img src='./docs/Images/ClownGangster.png' />
</div>

**Stats**

| **Health**   | Below Normal    |
| :----------- | :-------------- |
| **AI**       | Grunt           |
| **Factions** | [Clown][fclown] |

**Weapons**

| Gears       | Powerup |
| :---------- | :------ |
| ![TommyGun] | [Blast] |
| ![Shotgun]  | [Blast] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

### Cowboy

<div>
  <img src='./docs/Images/Cowboy_1.png' />
  <img src='./docs/Images/Cowboy_2.png' />
  <img src='./docs/Images/Cowboy_3.png' />
  <img src='./docs/Images/Cowboy_4.png' />
  <img src='./docs/Images/Cowboy_5.png' />
  <img src='./docs/Images/Cowboy_6.png' />
  <img src='./docs/Images/Cowboy_7.png' />
</div>

**Stats**

| **Health**    | Below Normal                                                                                                                                                  |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Speed**     | Above Normal                                                                                                                                                  |
| **AI**        | Cowboy                                                                                                                                                        |
| **Weapons**   | ![Sawedoff] ![Shotgun] ![Revolver] ![Magnum]                                                                                                                  |
| **Factions**  | [Cowboy][fcowboy]                                                                                                                                             |
| **Abilities** | <li>Has 15% chance of disarming the enemy's weapon after a successful shot.</li><li>Has 1% chance of destroying the enemy's weapon after it is disarmed.</li> |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Above Normal |
| **Melee Damage Dealt**      | Fairly Low   |
| **Size**                    | Small        |

</details>

<div>
  <img src='https://media.giphy.com/media/jTa70r0w527vQSCTEC/giphy.gif' width=500>
</div>

### Cyborg

<div>
  <img src='./docs/Images/Cyborg_1.png' />
  <img src='./docs/Images/Cyborg_2.png' />
  <img src='./docs/Images/Cyborg_3.png' />
  <img src='./docs/Images/Cyborg_4.png' />
  <img src='./docs/Images/Cyborg_5.png' />
  <img src='./docs/Images/Cyborg_6.png' />
</div>

**Stats**

| **Health**          | Below Normal    |
| :------------------ | :-------------- |
| **AI**              | Grunt           |
| **Zombie Immunity** | True            |
| **Factions**        | [Robot][frobot] |

**Weapons**

| Gears            | Powerup  |
| :--------------- | :------- |
| ![MachinePistol] | [Homing] |
| ![Pistol]        | [Homing] |
| ![Pistol45]      | [Homing] |
| ![DarkShotgun]   | [Homing] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

<!-- GIF: show near death effect -->

### Elf

<div>
  <img src='./docs/Images/Elf_1.png' />
  <img src='./docs/Images/Elf_2.png' />
</div>

**Stats**

| **Health**   | Below Normal                                                            |
| :----------- | :---------------------------------------------------------------------- |
| **AI**       | Grunt                                                                   |
| **Weapons**  | ![Knife] ![Chain] ![MP50] ![Shotgun] ![Flamethrower] ![Uzi] ![Flaregun] |
| **Factions** | [Santa][fsanta]                                                         |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

### Engineer

<div>
  <img src='./docs/Images/Engineer_1.png' />
  <img src='./docs/Images/Engineer_2.png' />
  <img src='./docs/Images/Engineer_3.png' />
  <img src='./docs/Images/Engineer_4.png' />
</div>

**Stats**

| **Health**    | Below Normal                                   |
| :------------ | :--------------------------------------------- |
| **AI**        | Grunt                                          |
| **Factions**  | [Engineer][fengineer]                          |
| **Abilities** | Builds an automatic [turret] every 12 seconds. |

**Weapons**

| Gears                  | Powerup |
| :--------------------- | :------ |
| ![LeadPipe]            |         |
| ![Pipe]                |         |
| ![Hammer]              |         |
| ![LeadPipe] ![Shotgun] |         |
| ![Pipe] ![Pistol]      |         |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Normal       |

</details>

<div>
  <img src='https://media.giphy.com/media/WaJMogoO5cfzMqxGEA/giphy.gif' width=500>
</div>

### Farmer

<div>
  <img src='./docs/Images/Farmer_1.png' />
  <img src='./docs/Images/Farmer_2.png' />
  <img src='./docs/Images/Farmer_3.png' />
</div>

**Stats**

| **Health**    | Below Normal                                       |
| :------------ | :------------------------------------------------- |
| **AI**        | Grunt                                              |
| **Weapons**   | ![SawedOff] ![Shotgun]                             |
| **Factions**  | [Farmer][ffarmer], [Hunter][fhunter].              |
| **Abilities** | Spawns 6 [chickens][chicken] to defense the owner. |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

<!-- GIF: show chicken -->

### Gangster

<div>
  <img src='./docs/Images/Gangster_1.png' />
  <img src='./docs/Images/Gangster_2.png' />
  <img src='./docs/Images/Gangster_3.png' />
  <img src='./docs/Images/Gangster_4.png' />
  <img src='./docs/Images/Gangster_5.png' />
  <img src='./docs/Images/Gangster_6.png' />
  <img src='./docs/Images/Gangster_7.png' />
  <img src='./docs/Images/Gangster_8.png' />
  <img src='./docs/Images/Gangster_9.png' />
  <img src='./docs/Images/Gangster_10.png' />
  <img src='./docs/Images/Gangster_11.png' />
  <img src='./docs/Images/Gangster_12.png' />
</div>

**Stats**

| **Health**    | Below Normal                                                                 |
| :------------ | :--------------------------------------------------------------------------- |
| **AI**        | Grunt                                                                        |
| **Weapons**   | ![Bat] ![Bottle] ![Uzi] ![Pistol] ![Revolver] ![Shotgun] ![Sawedoff] ![MP50] |
| **Factions**  | [Gangster][fgangster]                                                        |
| **Abilities** | Gathers in one spot and setups a [Camp] in each team.                        |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

<!-- GIF: show camp spawn gangster and start attacking -->

### Gangster Hulk

<div>
  <img src='./docs/Images/GangsterHulk_1.png' />
  <img src='./docs/Images/GangsterHulk_2.png' />
  <img src='./docs/Images/GangsterHulk_3.png' />
</div>

**Stats**

| **Health**    | Strong                                                             |
| :------------ | :----------------------------------------------------------------- |
| **Speed**     | Slow                                                               |
| **AI**        | Hulk                                                               |
| **Factions**  | [Gangster][fgangster], [Stripper][fstripper], [Kingpin][fkingpin]. |
| **Abilities** | Same as [Gangster].                                                |

**Weapons**

| Gears   | Powerup    |
| :------ | :--------- |
| ![fist] | [Breaking] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Very Low     |
| **Melee Damage Dealt**      | Above Normal |
| **Melee Force**             | Strong       |
| **Size**                    | Very Big     |

</details>

### Gardener

<div>
  <img src='./docs/Images/Gardener_1.png' />
  <img src='./docs/Images/Gardener_2.png' />
</div>

**Stats**

| **Health**   | Below Normal       |
| :----------- | :----------------- |
| **AI**       | Grunt              |
| **Weapons**  | ![teapot] ![Knife] |
| **Factions** | [Farmer][ffarmer]  |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

### Hunter

<div>
  <img src='./docs/Images/Hunter_1.png' />
  <img src='./docs/Images/Hunter_2.png' />
</div>

**Stats**

| **Health**        | Weak                                  |
| :---------------- | :------------------------------------ |
| **Speed**         | Slow                                  |
| **AI**            | Hunter                                |
| **Infinite Ammo** | True                                  |
| **Search Items**  | Health                                |
| **Factions**      | [Hunter][fhunter], [Farmer][ffarmer]. |
| **Abilities**     | Prioritize hunting bears over humans. |

**Weapons**

| Gears              | Powerup |
| :----------------- | :------ |
| ![Knife] ![bowwpn] | [Bow]   |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                            | Value        |
| :------------------------------- | :----------- |
| **Projectile Damage Dealt**      | Fairly High  |
| **Projectile Crit Chance Dealt** | Fairly High  |
| **Melee Damage Dealt**           | Fairly Low   |
| **Size**                         | Below Normal |

</details>

### Lumberjack

<div>
  <img src='./docs/Images/Lumberjack_1.png' />
  <img src='./docs/Images/Lumberjack_2.png' />
</div>

**Stats**

| **Health**   | Strong            |
| :----------- | :---------------- |
| **Speed**    | Slow              |
| **AI**       | Hulk              |
| **Factions** | [Farmer][ffarmer] |

**Weapons**

| Gears                   | Powerup |
| :---------------------- | :------ |
| ![Chainsaw]             |         |
| ![Axe] ![StrengthBoost] | [Gib]   |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Very Low     |
| **Melee Damage Dealt**      | Above Normal |
| **Melee Force**             | Strong       |
| **Size**                    | Very Big     |

</details>

### MetroCop

<div>
  <img src='./docs/Images/MetroCop_1.png' />
  <img src='./docs/Images/MetroCop_2.png' />
  <img src='./docs/Images/MetroCop_3.png' />
</div>

**Stats**

| **Health**    | Below Normal                                               |
| :------------ | :--------------------------------------------------------- |
| **AI**        | Grunt                                                      |
| **Factions**  | [MetroCop][fmetrocop]                                      |
| **Abilities** | Spawns up to 2 [LaserSweepers][lasersweeper] in each team. |

**Weapons**

| Gears                                 | Powerup |
| :------------------------------------ | :------ |
| ![ShockBaton] ![SMG] ![Lazer]         |         |
| ![ShockBaton] ![DarkShotgun] ![Lazer] |         |
| ![Assault] ![Lazer]                   |         |
| ![DarkShotgun] ![Lazer]               |         |
| ![SMG] ![Lazer]                       |         |
| ![ShockBaton] ![Lazer]                |         |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

<!-- GIF: show laser sweeper -->

### Mutant

<div>
  <img src='./docs/Images/Mutant_1.png' />
  <img src='./docs/Images/Mutant_2.png' />
  <img src='./docs/Images/Mutant_3.png' />
  <img src='./docs/Images/Mutant_4.png' />
  <img src='./docs/Images/Mutant_5.png' />
  <img src='./docs/Images/Mutant_6.png' />
  <img src='./docs/Images/Mutant_7.png' />
  <img src='./docs/Images/Mutant_8.png' />
</div>

**Stats**

| **Health**    | Strong                                                                         |
| :------------ | :----------------------------------------------------------------------------- |
| **AI**        | Grunt                                                                          |
| **Factions**  | [Mutant][fmutant]                                                              |
| **Abilities** | Split into 2 twins on dealth once. Each twin has 50% health, deals 50% damage. |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                   | Value                |
| :---------------------- | :------------------- |
| **Impact Damage Taken** | Extremely Vulnerable |
| **Size**                | Big                  |

</details>

<div>
  <img src='https://media.giphy.com/media/nhP5pq84vjatNYGyGr/giphy.gif' width=500>
</div>

### Nazi Hulk

<div>
  <img src='./docs/Images/NaziHulk.png' />
</div>

**Stats**

| **Health**   | Strong        |
| :----------- | :------------ |
| **Speed**    | Slow          |
| **AI**       | Hulk          |
| **Factions** | [Nazi][fnazi] |

**Weapons**

| Gears             | Powerup    |
| :---------------- | :--------- |
| ![fist] ![Pistol] | [Breaking] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Very Low     |
| **Melee Damage Dealt**      | Above Normal |
| **Melee Force**             | Strong       |
| **Size**                    | Very Big     |

</details>

### Nazi Soldier

<div>
  <img src='./docs/Images/NaziSoldier_1.png' />
  <img src='./docs/Images/NaziSoldier_2.png' />
  <img src='./docs/Images/NaziSoldier_3.png' />
</div>

**Stats**

| **Health**   | Below Normal  |
| :----------- | :------------ |
| **AI**       | Grunt         |
| **Factions** | [Nazi][fnazi] |

**Weapons**

| Gears                       | Powerup |
| :-------------------------- | :------ |
| ![MP50]                     |         |
| ![MP50] ![Grenade]          |         |
| ![Knife] ![MP50] ![Grenade] |         |
| ![Carbine]                  |         |
| ![Knife] ![Carbine]         |         |
| ![Carbine] ![Grenade]       |         |
| ![Pistol]                   |         |
| ![Knife] ![Pistol]          |         |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

### Police

<div>
  <img src='./docs/Images/PoliceOfficer_1.png' />
  <img src='./docs/Images/PoliceOfficer_2.png' />
  <img src='./docs/Images/PoliceOfficer_3.png' />
  <img src='./docs/Images/PoliceOfficer_4.png' />
  <img src='./docs/Images/PoliceOfficer_5.png' />
  <img src='./docs/Images/PoliceOfficer_6.png' />
  <img src='./docs/Images/PoliceOfficer_7.png' />
</div>

**Stats**

| **Health**   | Below Normal                                   |
| :----------- | :--------------------------------------------- |
| **AI**       | Grunt                                          |
| **Factions** | [Police][fpolice], [Police SWAT][fpoliceswat]. |

**Weapons**

| Gears                | Powerup |
| :------------------- | :------ |
| ![Baton]             |         |
| ![Baton] ![Pistol]   | [Taser] |
| ![Baton] ![Shotgun]  |         |
| ![Baton] ![Revolver] | [Taser] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

### Police SWAT

<div>
  <img src='./docs/Images/SWAT_1.png' />
  <img src='./docs/Images/SWAT_2.png' />
</div>

**Stats**

| **Health**   | Below Normal                                   |
| :----------- | :--------------------------------------------- |
| **AI**       | Grunt                                          |
| **Factions** | [Police][fpolice], [Police SWAT][fpoliceswat]. |

**Weapons**

| Gears                                | Powerup   |
| :----------------------------------- | :-------- |
| ![Knife] ![Pistol45] ![C4]           | [Termite] |
| ![Knife] ![MachinePistol] ![Grenade] | [Termite] |
| ![Knife] ![Assault]                  | [Termite] |
| ![Knife] ![SMG]                      | [Termite] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

### Lab Assistant

<div>
  <img src='./docs/Images/LabAssistant_1.png' />
  <img src='./docs/Images/LabAssistant_2.png' />
</div>

**Stats**

| **Health**   | Below Normal            |
| :----------- | :---------------------- |
| **AI**       | Grunt                   |
| **Factions** | [Scientist][fscientist] |

**Weapons**

| Gears                      | Powerup            |
| :------------------------- | :----------------- |
| ![Pistol]                  | [Precise Bouncing] |
| ![Pistol] ![StrengthBoost] | [Precise Bouncing] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

### Scientist

<div>
  <img src='./docs/Images/Scientist_1.png' />
  <img src='./docs/Images/Scientist_2.png' />
</div>

**Stats**

| **Health**   | Below Normal            |
| :----------- | :---------------------- |
| **AI**       | Grunt                   |
| **Factions** | [Scientist][fscientist] |

**Weapons**

| Gears       | Powerup            |
| :---------- | :----------------- |
| ![Revolver] | [Precise Bouncing] |
| ![Pistol]   | [Precise Bouncing] |
| ![Pistol45] | [Precise Bouncing] |
| ![LeadPipe] |                    |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

### Survivor

<div>
  <img src='./docs/Images/Survivor_1.png' />
  <img src='./docs/Images/Survivor_2.png' />
  <img src='./docs/Images/Survivor_3.png' />
  <img src='./docs/Images/Survivor_4.png' />
  <img src='./docs/Images/Survivor_5.png' />
  <img src='./docs/Images/Survivor_6.png' />
</div>

**Stats**

| **Health**    | Weak                                                           |
| :------------ | :------------------------------------------------------------- |
| **AI**        | Normal                                                         |
| **Weapons**   | ![SMG] ![Knife] ![Machete] ![SawedOff] ![Revolver] ![LeadPipe] |
| **Factions**  | [Survivor][fsurvivor]                                          |
| **Abilities** | Turns into zombie on dealth due to infection.                  |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

<div>
  <img src='https://media.giphy.com/media/c6n8FAOfEc5G6KAA5f/giphy.gif' width=500>
</div>

### Sniper

<div>
  <img src='./docs/Images/Sniper_1.png' />
  <img src='./docs/Images/Sniper_2.png' />
</div>

**Stats**

| **Health**       | Weak                                    |
| :--------------- | :-------------------------------------- |
| **Speed**        | Slow                                    |
| **AI**           | Sniper                                  |
| **Search Items** | Primary                                 |
| **Factions**     | [Soldier][fsoldier], [Sniper][fsniper]. |

**Weapons**

| Gears                       | Powerup |
| :-------------------------- | :------ |
| ![Knife] ![Sniper]          |         |
| ![SilencedPistol] ![sniper] |         |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                            | Value        |
| :------------------------------- | :----------- |
| **Projectile Damage Dealt**      | Fairly High  |
| **Projectile Crit Chance Dealt** | Fairly High  |
| **Melee Damage Dealt**           | Fairly Low   |
| **Size**                         | Below Normal |

</details>

### Soldier

<div>
  <img src='./docs/Images/Soldier_1.png' />
  <img src='./docs/Images/Soldier_2.png' />
  <img src='./docs/Images/Soldier_3.png' />
  <img src='./docs/Images/Soldier_4.png' />
  <img src='./docs/Images/Soldier_5.png' />
  <img src='./docs/Images/Soldier_6.png' />
  <img src='./docs/Images/Soldier_7.png' />
  <img src='./docs/Images/Soldier_8.png' />
</div>

**Stats**

| **Health**       | Below Normal        |
| :--------------- | :------------------ |
| **AI**           | Soldier             |
| **Search Items** | Primary             |
| **Factions**     | [Soldier][fsoldier] |

**Weapons**

| Gears                | Powerup       |
| :------------------- | :------------ |
| ![Pistol]            | [Penetration] |
| ![Shotgun] ![Pistol] | [Penetration] |
| ![Assault] ![Pistol] | [Penetration] |
| ![SMG] ![Pistol]     | [Penetration] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

### Spacer

<div>
  <img src='./docs/Images/Spacer_1.png' />
  <img src='./docs/Images/Spacer_2.png' />
  <img src='./docs/Images/Spacer_3.png' />
  <img src='./docs/Images/Spacer_4.png' />
  <img src='./docs/Images/Spacer_5.png' />
  <img src='./docs/Images/Spacer_6.png' />
  <img src='./docs/Images/Spacer_7.png' />
  <img src='./docs/Images/Spacer_8.png' />
</div>

**Stats**

| **Health**   | Below Normal      |
| :----------- | :---------------- |
| **AI**       | Grunt             |
| **Factions** | [Spacer][fspacer] |

**Weapons**

| Gears                     | Powerup |
| :------------------------ | :------ |
| ![ShockBaton]             |         |
| ![LeadPipe]               |         |
| ![Assault] ![Lazer]       | [Gauss] |
| ![Pistol] ![Lazer]        | [Gauss] |
| ![MachinePistol] ![Lazer] | [Gauss] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

### Space Sniper

<div>
  <img src='./docs/Images/SpaceSniper_1.png' />
  <img src='./docs/Images/SpaceSniper_2.png' />
  <img src='./docs/Images/SpaceSniper_3.png' />
</div>

**Stats**

| **Health**       | Weak                                             |
| :--------------- | :----------------------------------------------- |
| **Speed**        | Slow                                             |
| **AI**           | Sniper                                           |
| **Search Items** | Primary                                          |
| **Factions**     | [Space Sniper][fspacesniper], [Spacer][fspacer]. |

**Weapons**

| Gears               | Powerup |
| :------------------ | :------ |
| ![Sniper]           | [Gauss] |
| ![sniper] ![Pistol] | [Gauss] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                            | Value        |
| :------------------------------- | :----------- |
| **Projectile Damage Dealt**      | Normal       |
| **Projectile Crit Chance Dealt** | Normal       |
| **Melee Damage Dealt**           | Fairly Low   |
| **Size**                         | Below Normal |

</details>

### Stripper

<div>
  <img src='./docs/Images/Stripper_1.png' />
  <img src='./docs/Images/Stripper_2.png' />
  <img src='./docs/Images/Stripper_3.png' />
  <img src='./docs/Images/Stripper_4.png' />
  <img src='./docs/Images/Stripper_5.png' />
  <img src='./docs/Images/Stripper_6.png' />
  <img src='./docs/Images/Stripper_7.png' />
  <img src='./docs/Images/Stripper_8.png' />
  <img src='./docs/Images/Stripper_9.png' />
</div>

**Stats**

| **Health**        | Weak                                                      |
| :---------------- | :-------------------------------------------------------- |
| **Speed**         | Above Normal                                              |
| **AI**            | Hard                                                      |
| **Infinite Ammo** | True                                                      |
| **Search Items**  | Makeshift, Health                                         |
| **Factions**      | [Stripper][fstripper]                                     |
| **Abilities**     | Recruits one of the hulk bots to follow and protect them. |

**Weapons**

| Gears            | Powerup   |
| :--------------- | :-------- |
| ![MachinePistol] | [Tearing] |
| ![Revolver]      | [Tearing] |
| ![Pistol]        | [Tearing] |
| ![Sawedoff]      | [Tearing] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                            | Value        |
| :------------------------------- | :----------- |
| **Projectile Damage Dealt**      | Fairly High  |
| **Projectile Crit Chance Dealt** | Fairly High  |
| **Melee Damage Dealt**           | Fairly Low   |
| **Fire Damage Taken**            | Vulnerable   |
| **Size**                         | Below Normal |

</details>

### Thug

<div>
  <img src='./docs/Images/Thug_1.png' />
  <img src='./docs/Images/Thug_2.png' />
  <img src='./docs/Images/Thug_3.png' />
  <img src='./docs/Images/Thug_4.png' />
  <img src='./docs/Images/Thug_5.png' />
  <img src='./docs/Images/Thug_6.png' />
  <img src='./docs/Images/Thug_7.png' />
  <img src='./docs/Images/Thug_8.png' />
  <img src='./docs/Images/Thug_9.png' />
  <img src='./docs/Images/Thug_10.png' />
  <img src='./docs/Images/Thug_11.png' />
  <img src='./docs/Images/Thug_12.png' />
  <img src='./docs/Images/Thug_13.png' />
  <img src='./docs/Images/Thug_14.png' />
  <img src='./docs/Images/Thug_15.png' />
  <img src='./docs/Images/Thug_16.png' />
  <img src='./docs/Images/Thug_17.png' />
  <img src='./docs/Images/Thug_18.png' />
</div>

**Stats**

| **Health**       | Below Normal                                                                                                                        |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **AI**           | Grunt                                                                                                                               |
| **Search Items** | Primary, Secondary, Melee                                                                                                           |
| **Weapons**      | ![Bat] ![LeadPipe] ![Hammer] ![Chain] ![MachinePistol]                                                                              |
| **Factions**     | [Thug][fthug]                                                                                                                       |
| **Abilities**    | <li>x3 damage to objects.</li><li>Targets and loots objects if not in danger.</li><li>Discovers new weapons in looted objects.</li> |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

<div>
  <img src='https://media.giphy.com/media/cmuFFVuukzffGiAMW0/giphy.gif' width=500>
</div>

### Thug Hulk

<div>
  <img src='./docs/Images/ThugHulk_1.png' />
  <img src='./docs/Images/ThugHulk_2.png' />
  <img src='./docs/Images/ThugHulk_3.png' />
</div>

**Stats**

| **Health**    | Strong                                                       |
| :------------ | :----------------------------------------------------------- |
| **Speed**     | Slow                                                         |
| **AI**        | Hulk                                                         |
| **Factions**  | [Gangster][fgangster], [Stripper][fstripper], [Thug][fthug]. |
| **Abilities** | Same as [Thug].                                              |

**Weapons**

| Gears       | Powerup    |
| :---------- | :--------- |
| ![fist]     | [Breaking] |
| ![LeadPipe] | [Breaking] |
| ![Pipe]     | [Breaking] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Very Low     |
| **Melee Damage Dealt**      | Above Normal |
| **Melee Force**             | Strong       |
| **Size**                    | Very Big     |

</details>

### Punk

<div>
  <img src='./docs/Images/Punk_1.png' />
  <img src='./docs/Images/Punk_2.png' />
  <img src='./docs/Images/Punk_3.png' />
  <img src='./docs/Images/Punk_4.png' />
  <img src='./docs/Images/Punk_5.png' />
  <img src='./docs/Images/Punk_6.png' />
  <img src='./docs/Images/Punk_7.png' />
  <img src='./docs/Images/Punk_8.png' />
  <img src='./docs/Images/Punk_9.png' />
  <img src='./docs/Images/Punk_10.png' />
  <img src='./docs/Images/Punk_11.png' />
  <img src='./docs/Images/Punk_12.png' />
  <img src='./docs/Images/Punk_13.png' />
  <img src='./docs/Images/Punk_14.png' />
</div>

**Stats**

| **Health**        | Below Normal  |
| :---------------- | :------------ |
| **AI**            | Grunt         |
| **Infinite Ammo** | True          |
| **Factions**      | [Punk][fpunk] |

**Weapons**

| Gears            | Powerup     |
| :--------------- | :---------- |
| ![Bat] ![Pistol] | [Knockback] |
| ![Knife] ![Uzi]  | [Knockback] |
| ![LeadPipe]      |             |
| ![Baseball]      |             |
| ![Pistol45]      | [Knockback] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Below Normal |
| **Melee Damage Dealt**      | Below Normal |
| **Size**                    | Below Normal |

</details>

### Punk Hulk

<div>
  <img src='./docs/Images/PunkHulk_1.png' />
  <img src='./docs/Images/PunkHulk_2.png' />
  <img src='./docs/Images/PunkHulk_3.png' />
  <img src='./docs/Images/PunkHulk_4.png' />
  <img src='./docs/Images/PunkHulk_5.png' />
</div>

**Stats**

| **Health**   | Strong                                |
| :----------- | :------------------------------------ |
| **Speed**    | Slow                                  |
| **AI**       | Hulk                                  |
| **Factions** | [Stripper][fstripper], [Punk][fpunk]. |

**Weapons**

| Gears       | Powerup    |
| :---------- | :--------- |
| ![fist]     | [Breaking] |
| ![LeadPipe] | [Breaking] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Dealt** | Very Low     |
| **Melee Damage Dealt**      | Above Normal |
| **Melee Force**             | Strong       |
| **Size**                    | Very Big     |

</details>

### Zombie

A basic common zombie.

<div>
  <img src='./docs/Images/Zombie_1.png' />
  <img src='./docs/Images/Zombie_2.png' />
</div>

**Stats**

| **Health**    | Weak                                                                                                                                                          |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Run Speed** | Slow                                                                                                                                                          |
| **AI**        | ZombieSlow                                                                                                                                                    |
| **Factions**  | [Zombie][fzombie], [Zombie Mutated][fzombiemutated], [Zombie Boss][fzombieboss].                                                                              |
| **Abilities** | <li>Infects the enemies after a successful punch.</li><li>Infected players turn into zombies on dealth. The only exception is when their body are burnt.</li> |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value        |
| :--------------------- | :----------- |
| **Melee Damage Dealt** | Low          |
| **Size**               | Below Normal |

</details>

<div>
  <img src='https://media.giphy.com/media/bKYeC588EKqNSfMh3F/giphy.gif' width=500>
</div>

### Zombie Agent

<div>
  <img src='./docs/Images/ZombieAgent.png' />
</div>

A common zombie which is the same as [Zombie] except for the following stats:

| **Weapons** | ![Pistol] ![SilencedPistol] ![SilencedUzi] |
| :---------- | :----------------------------------------- |

### Zombie Bruiser

<div>
  <img src='./docs/Images/ZombieBruiser.png' />
</div>

A mutated zombie.

**Stats**

| **Health**    | Above Normal                                                                     |
| :------------ | :------------------------------------------------------------------------------- |
| **Speed**     | Slow                                                                             |
| **AI**        | ZombieHulk                                                                       |
| **Factions**  | [Zombie][fzombie], [Zombie Mutated][fzombiemutated], [Zombie Boss][fzombieboss]. |
| **Abilities** | Same as [Zombie].                                                                |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value         |
| :--------------------- | :------------ |
| **Melee Damage Dealt** | Above Normal  |
| **Melee Force**        | Strong        |
| **Size**               | Extremely Big |

</details>

### Zombie Child

<div>
  <img src='./docs/Images/ZombieChild_1.png' />
  <img src='./docs/Images/ZombieChild_2.png' />
</div>

A mutated zombie.

**Stats**

| **Health**    | Extremely Weak                                                                   |
| :------------ | :------------------------------------------------------------------------------- |
| **Speed**     | Fast                                                                             |
| **AI**        | ZombieFast                                                                       |
| **Factions**  | [Zombie][fzombie], [Zombie Mutated][fzombiemutated], [Zombie Boss][fzombieboss]. |
| **Abilities** | Same as [Zombie].                                                                |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value      |
| :--------------------- | :--------- |
| **Melee Damage Dealt** | Low        |
| **Melee Force**        | Weak       |
| **Size**               | Very Small |

</details>

### Zombie Fat

<div>
  <img src='./docs/Images/ZombieFat.png' />
</div>

A mutated zombie.

**Stats**

| **Health**    | Embarrassingly Weak                                                                                                    |
| :------------ | :--------------------------------------------------------------------------------------------------------------------- |
| **Speed**     | Barely Any                                                                                                             |
| **AI**        | ZombieSlow                                                                                                             |
| **Factions**  | [Zombie][fzombie], [Zombie Mutated][fzombiemutated], [Zombie Boss][fzombieboss].                                       |
| **Abilities** | Same as [Zombie]. On its dealth, the body is exploded into pieces and infects all players inside the explosion radius. |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value       |
| :--------------------- | :---------- |
| **Melee Damage Dealt** | Fairly High |
| **Size**               | Chonky      |

</details>

<div>
  <img src='https://media.giphy.com/media/ok9ez0R96pOOrP5zQo/giphy.gif' width=500>
</div>

### Zombie Flamer

<div>
  <img src='./docs/Images/ZombieFlamer.png' />
</div>

A mutated zombie.

**Stats**

| **Health**    | Extremely Weak                                                                   |
| :------------ | :------------------------------------------------------------------------------- |
| **Speed**     | Fast                                                                             |
| **AI**        | ZombieFast                                                                       |
| **Factions**  | [Zombie][fzombie], [Zombie Mutated][fzombiemutated], [Zombie Boss][fzombieboss]. |
| **Abilities** | Same as [Zombie]. Is set on max fire on startup.                                 |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value           |
| :--------------------- | :-------------- |
| **Fire Damage Taken**  | Ultra Resistant |
| **Melee Damage Dealt** | Very Low        |
| **Size**               | Below Normal    |

</details>

<div>
  <img src='https://media.giphy.com/media/zessK3iU6edXYBJ1Yg/giphy.gif' width=500>
</div>

### Zombie Gangster

<div>
  <img src='./docs/Images/ZombieGangster_1.png' />
  <img src='./docs/Images/ZombieGangster_2.png' />
  <img src='./docs/Images/ZombieGangster_3.png' />
  <img src='./docs/Images/ZombieGangster_4.png' />
  <img src='./docs/Images/ZombieGangster_5.png' />
</div>

A common zombie which is the same as [Zombie] except for the following stats:

| **Weapons** | ![TommyGun] ![Shotgun] ![Revolver] ![Pistol] |
| :---------- | :------------------------------------------- |

### Zombie Ninja

<div>
  <img src='./docs/Images/ZombieNinja.png' />
</div>

A common zombie which is the same as [Zombie] except for the following stats:

| **Weapons** | ![Katana] |
| :---------- | :-------- |

### Zombie Police

<div>
  <img src='./docs/Images/ZombiePolice_1.png' />
  <img src='./docs/Images/ZombiePolice_2.png' />
</div>

A common zombie which is the same as [Zombie] except for the following stats:

| **Weapons** | ![Baton] ![Revolver] |
| :---------- | :------------------- |

### Zombie Soldier

<div>
  <img src='./docs/Images/ZombieSoldier_1.png' />
  <img src='./docs/Images/ZombieSoldier_2.png' />
</div>

A common zombie which is the same as [Zombie] except for the following stats:

| **Weapons** | ![SMG] ![Assault] ![Shotgun] ![Grenade] ![MineWpn] |
| :---------- | :------------------------------------------------- |

### Zombie Thug

<div>
  <img src='./docs/Images/ZombieThug_1.png' />
  <img src='./docs/Images/ZombieThug_2.png' />
</div>

A common zombie which is the same as [Zombie] except for the following stats:

| **Weapons** | ![Bat] ![Knife] ![Pistol] ![MolotovWpn] |
| :---------- | :-------------------------------------- |

### Zombie Worker

<div>
  <img src='./docs/Images/ZombieWorker.png' />
</div>

A common zombie which is the same as [Zombie] except for the following stats:

| **Weapons** | ![Pipe] ![Hammer] ![Axe] ![Chainsaw] |
| :---------- | :----------------------------------- |

## Bosses

They are bots that are a bit harder to beat.

### Agent 79

<div>
  <img src='./docs/Images/Agent79.png' />
</div>

**Stats**

| **Health**        | Strong             |
| :---------------- | :----------------- |
| **AI**            | Expert             |
| **Infinite Ammo** | True               |
| **Search Items**  | Secondary, Health. |
| **Factions**      | [Agent][fagent]    |

**Weapons**

| Gears                                           | Powerup  |
| :---------------------------------------------- | :------- |
| ![Knife] ![Bazooka] ![Pistol] ![C4] ![Slowmo10] | [Object] |

### Amos

<div>
  <img src='./docs/Images/Amos.png' />
</div>

**Stats**

| **Health**       | Very Strong       |
| :--------------- | :---------------- |
| **Speed**        | Below Normal      |
| **AI**           | Hard              |
| **Search Items** | Primary           |
| **Factions**     | [Spacer][fspacer] |

**Weapons**

| Gears                    | Powerup |
| :----------------------- | :------ |
| ![DarkShotgun] ![Pistol] | [Gauss] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                   | Value            |
| :---------------------- | :--------------- |
| **Melee Damage Dealt**  | High             |
| **Impact Damage Taken** | Fairly Resistant |
| **Melee Force**         | Above Normal     |
| **Size**                | Big              |

</details>

### Ass Kicker

<img src='./docs/Images/AssKicker.png' />

**Stats**

| **Health**        | Strong                          |
| :---------------- | :------------------------------ |
| **Speed**         | Extremely Fast                  |
| **AI**            | AssKicker                       |
| **Infinite Ammo** | True                            |
| **Search Items**  | Melee                           |
| **Weapons**       | ![Baton]                        |
| **Factions**      | [Assassin][fassassin]           |
| **Abilities**     | Kicks the enemy into the space. |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value        |
| :--------------------- | :----------- |
| **Melee Damage Dealt** | Above Normal |
| **Energy Recharge**    | Quick        |
| **Melee Force**        | One Punch    |
| **Size**               | Big          |

</details>

<div>
  <img src='https://media.giphy.com/media/QOYKCPHEoO5akgFAct/giphy.gif' width=500>
</div>

### Balista

<img src='./docs/Images/Balista.png' />

**Stats**

| **Health**        | Very Strong                                                                                     |
| :---------------- | :---------------------------------------------------------------------------------------------- |
| **Speed**         | Fast                                                                                            |
| **AI**            | Hard                                                                                            |
| **Infinite Ammo** | True                                                                                            |
| **Search Items**  | All                                                                                             |
| **Factions**      | [Punk][fpunk]                                                                                   |
| **Abilities**     | Can equip 2 primary weapons: **Assault Rifle** and **Grenade Launcher** with [Spinner] powerup. |

**Weapons**

| Gears                                   | Powerup   |
| :-------------------------------------- | :-------- |
| ![Chain] ![Assault] ![Uzi] ![GLauncher] | [Spinner] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value        |
| :--------------------- | :----------- |
| **Melee Damage Dealt** | Fairly Low   |
| **Melee Force**        | Above Normal |
| **Size**               | Above Normal |

</details>

### Balloonatic

<img src='./docs/Images/Balloonatic.png' />

**Stats**

| **Health**        | Very Strong                 |
| :---------------- | :-------------------------- |
| **AI**            | Hard                        |
| **Infinite Ammo** | True                        |
| **Search Items**  | Primary, Health.            |
| **Factions**      | [Clown][fclown]             |
| **Abilities**     | Has balloons for no reason. |

**Weapons**

| Gears                  | Powerup  |
| :--------------------- | :------- |
| ![Knife] ![SMG] ![Uzi] | [Helium] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                   | Value          |
| :---------------------- | :------------- |
| **Impact Damage Taken** | Very Resistant |
| **Size**                | Very Big       |

</details>

### Bazooka Jane

<img src='./docs/Images/BazookaJane.png' />

**Stats**

| **Health**       | Strong                                             |
| :--------------- | :------------------------------------------------- |
| **Speed**        | Slow                                               |
| **AI**           | Hard                                               |
| **Search Items** | Health, Streetsweeper, Melee, Powerups, Secondary. |
| **Factions**     | [Soldier][fsoldier]                                |

**Weapons**

| Gears                                     | Powerup           |
| :---------------------------------------- | :---------------- |
| ![Knife] ![Bazooka] ![Pistol] ![Slowmo10] | [Suicide Fighter] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats    | Value        |
| :------- | :----------- |
| **Size** | Above Normal |

</details>

### Beast

<img src='./docs/Images/Beast.png' />

**Stats**

| **Health**        | Extremely Strong                 |
| :---------------- | :------------------------------- |
| **AI**            | Hard                             |
| **Infinite Ammo** | True                             |
| **Search Items**  | Health, Streetsweeper, Powerups. |
| **Factions**      | [Thug][fthug]                    |

**Weapons**

| Gears                        | Powerup      |
| :--------------------------- | :----------- |
| ![Machete] ![C4] ![Slowmo10] | [Earthquake] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value         |
| :--------------------- | :------------ |
| **Energy Consumption** | 0             |
| **Size**               | Extremely Big |

</details>

### Berserker

<img src='./docs/Images/Berserker.png' />

**Stats**

| **Health**       | Above Normal                                                                                                                                                                      |
| :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Speed**        | Hacker                                                                                                                                                                            |
| **AI**           | God                                                                                                                                                                               |
| **Search Items** | Melee                                                                                                                                                                             |
| **Faction**      | [Mutant][fmutant]                                                                                                                                                                 |
| **Abilities**    | <li>Has extremely high melee damage that can one-hit kill almost all life forms.</li><li>Health is reduced gradually over time.</li><li>Gains 5 HP after executing an enemy.</li> |

**Weapons**

| Gears  | Powerup |
| :----- | :------ |
| ![Axe] | [Gib]   |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value        |
| :--------------------- | :----------- |
| **Melee Damage Dealt** | Ultra High   |
| **Melee Force**        | Ultra Strong |
| **Size**               | Big          |

</details>

<div>
  <img src='https://media.giphy.com/media/eI55bQ6yMf4EyIaScn/giphy.gif' width=500>
</div>

### Big Mutant

<div>
  <img src='./docs/Images/Mutant_1.png' />
  <img src='./docs/Images/Mutant_2.png' />
  <img src='./docs/Images/Mutant_3.png' />
  <img src='./docs/Images/Mutant_4.png' />
  <img src='./docs/Images/Mutant_5.png' />
  <img src='./docs/Images/Mutant_6.png' />
  <img src='./docs/Images/Mutant_7.png' />
  <img src='./docs/Images/Mutant_8.png' />
</div>

**Stats**

| **Health**       | Ultra Strong      |
| :--------------- | :---------------- |
| **AI**           | MeleeHard         |
| **Search Items** | Health, Powerups. |
| **Faction**      | [Mutant][fmutant] |

**Weapons**

| Gears  | Powerup     |
| :----- | :---------- |
| ![Axe] | [Splitting] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                   | Value                |
| :---------------------- | :------------------- |
| **Impact Damage Taken** | Extremely Vulnerable |
| **Size**                | Very Big             |

</details>

### Bobby

<div>
  <img src='./docs/Images/Bobby.png' />
</div>

**Stats**

| **Health**        | Strong                                      |
| :---------------- | :------------------------------------------ |
| **Speed**         | Above Normal                                |
| **AI**            | Hard                                        |
| **Infinite Ammo** | True                                        |
| **Search Items**  | Secondary, Health, Streetsweeper, Powerups. |
| **Faction**       | [Thug][fthug]                               |

**Weapons**

| Gears                | Powerup       |
| :------------------- | :------------ |
| ![Knife] ![Shotgun]  | [Scattershot] |
| ![Knife] ![Sawedoff] | [Scattershot] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value        |
| :-------------------------- | :----------- |
| **Projectile Damage Taken** | Resistant    |
| **Projectile Damage Dealt** | Fairly High  |
| **Size**                    | Above Normal |

</details>

### Boffin

<div>
  <img src='./docs/Images/Boffin.png' />
</div>

**Stats**

| **Health**        | Very Strong                      |
| :---------------- | :------------------------------- |
| **AI**            | Hard                             |
| **Infinite Ammo** | True                             |
| **Search Items**  | Health, Streetsweeper, Powerups. |
| **Faction**       | [Scientist][fscientist]          |
| **Abilities**     | Is immune to shrinking.          |

**Weapons**

| Gears                    | Powerup     |
| :----------------------- | :---------- |
| ![GLauncher] ![Slowmo10] | [Shrinking] |

### Chairman

<div>
  <img src='./docs/Images/Chairman.png' />
</div>

**Stats**

| **Health**        | Very Strong                  |
| :---------------- | :--------------------------- |
| **Run Speed**     | Hacker                       |
| **Sprint Speed**  | Fast                         |
| **AI**            | Melee Expert                 |
| **Infinite Ammo** | True                         |
| **Search Items**  | Makeshift, Health, Powerups. |
| **Faction**       | [Stripper][fstripper]        |

**Weapons**

| Gears                      | Powerup    |
| :------------------------- | :--------- |
| ![Chair] ![C4] ![Slowmo10] | [Pushback] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats           | Value        |
| :-------------- | :----------- |
| **Melee Force** | Strong       |
| **Size**        | Above Normal |

</details>

### Cindy

<div>
  <img src='./docs/Images/Cindy.png' />
</div>

**Stats**

| **Health**        | Above Normal                                |
| :---------------- | :------------------------------------------ |
| **Speed**         | Fast                                        |
| **AI**            | Expert                                      |
| **Infinite Ammo** | True                                        |
| **Search Items**  | Secondary, Streetsweeper, Powerups, Health. |
| **Faction**       | [Police][fpolice]                           |
| **Abilities**     | Equips handguns with [Stun] powerup.        |

**Weapons**

| Gears                    | Powerup |
| :----------------------- | :------ |
| ![ShockBaton] ![Pistol]  | [Stun]  |
| ![ShockBaton] ![Assault] | [Stun]  |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats           | Value        |
| :-------------- | :----------- |
| **Energy**      | High         |
| **Melee Force** | Above Normal |

</details>

### Demolitionist

<div>
  <img src='./docs/Images/Demolitionist.png' />
</div>

**Stats**

| **Health**        | Strong                 |
| :---------------- | :--------------------- |
| **Speed**         | Barely Any             |
| **AI**            | Range Hard             |
| **Infinite Ammo** | True                   |
| **Search Items**  | Primary, Health.       |
| **Weapons**       | ![Sniper] ![GLauncher] |
| **Faction**       | None                   |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                            | Value        |
| :------------------------------- | :----------- |
| **Projectile Damage Dealt**      | Ultra High   |
| **Projectile Crit Chance Dealt** | Ultra High   |
| **Melee Damage Dealt**           | Very High    |
| **Size**                         | Below Normal |

</details>

### Demoman

<div>
  <img src='./docs/Images/Demoman.png' />
</div>

**Stats**

| **Health**        | Very Strong                  |
| :---------------- | :--------------------------- |
| **Speed**         | Below Normal                 |
| **AI**            | Expert                       |
| **Infinite Ammo** | True                         |
| **Search Items**  | Makeshift, Health, Powerups. |
| **Faction**       | [Nazi][fnazi]                |

**Weapons**

| Gears                   | Powerup |
| :---------------------- | :------ |
| ![GLauncher] ![Machete] | [Mine]  |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                      | Value               |
| :------------------------- | :------------------ |
| **Explosion Damage Taken** | Extremely Resistant |
| **Melee Damage Dealt**     | High                |
| **Melee Force**            | Strong              |
| **Size**                   | Big                 |

</details>

### Firebug

<div>
  <img src='./docs/Images/Firebug.png' />
</div>

**Stats**

| **Health**        | Very Strong              |
| :---------------- | :----------------------- |
| **AI**            | Expert                   |
| **Infinite Ammo** | True                     |
| **Search Items**  | Melee, Health, Powerups. |
| **Faction**       | [Punk][fpunk]            |
| **Abilities**     | Is immune to fire.       |

**Weapons**

| Gears                    | Powerup |
| :----------------------- | :------ |
| ![Pipe] ![MachinePistol] | [Fire]  |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                 | Value      |
| :-------------------- | :--------- |
| **Fire Damage Taken** | Unbeatable |
| **Size**              | Big        |

</details>

### Fireman

<div>
  <img src='./docs/Images/Fireman.png' />
</div>

**Stats**

| **Health**        | Strong                     |
| :---------------- | :------------------------- |
| **Speed**         | Fast                       |
| **AI**            | Assassin Melee             |
| **Infinite Ammo** | True                       |
| **Faction**       | [Pyromaniac][fpyromaniac]  |
| **Abilities**     | Becomes faster if on fire. |

**Weapons**

| Gears                | Powerup      |
| :------------------- | :----------- |
| ![Axe] ![molotovwpn] | [Fire Trail] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value               |
| :--------------------- | :------------------ |
| **Fire Damage Taken**  | Extremely Resistant |
| **Melee Damage Taken** | Resistant           |

</details>

### Fritzliebe

<div>
  <img src='./docs/Images/Fritzliebe.png' />
</div>

**Stats**

| **Health**        | Very Strong      |
| :---------------- | :--------------- |
| **AI**            | Expert           |
| **Infinite Ammo** | True             |
| **Search Items**  | Primary, Health. |
| **Faction**       | [Nazi][fnazi]    |

**Weapons**

| Gears     | Powerup     |
| :-------- | :---------- |
| ![Magnum] | [Lightning] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats    | Value        |
| :------- | :----------- |
| **Size** | Below Normal |

</details>

### Funnyman

<div>
  <img src='./docs/Images/Funnyman.png' />
</div>

**Stats**

| **Health**       | Strong            |
| :--------------- | :---------------- |
| **AI**           | Expert            |
| **Search Items** | Health, Powerups. |
| **Faction**      | [Clown][fclown]   |

**Weapons**

| Gears               | Powerup   |
| :------------------ | :-------- |
| ![Fist]             | [Megaton] |
| ![Fist] ![TommyGun] | [Megaton] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value        |
| :--------------------- | :----------- |
| **Melee Damage Taken** | Resistant    |
| **Size**               | Above Normal |

</details>

### Jo

<div>
  <img src='./docs/Images/Jo.png' />
</div>

**Stats**

| **Health**       | Extremely Strong   |
| :--------------- | :----------------- |
| **AI**           | Melee Expert       |
| **Search Items** | Makeshift, Health. |
| **Faction**      | [Biker][fbiker]    |

**Weapons**

| Gears                 | Powerup   |
| :-------------------- | :-------- |
| ![Bottle] ![Slowmo10] | [Hurling] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats           | Value  |
| :-------------- | :----- |
| **Melee Force** | Strong |
| **Size**        | Big    |

</details>

### Hacker

<div>
  <img src='./docs/Images/Hacker_1.png' />
  <img src='./docs/Images/Hacker_2.png' />
</div>

**Stats**

| **Health**  | Above Normal |
| :---------- | :----------- |
| **Speed**   | Above Normal |
| **AI**      | Hacker       |
| **Faction** | None         |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value |
| :--------------------- | :---- |
| **Energy Consumption** | None  |

</details>

### Handler

<div>
  <img src='./docs/Images/Handler.png' />
</div>

**Stats**

| **Health**        | Strong                                |
| :---------------- | :------------------------------------ |
| **Speed**         | Above Normal                          |
| **AI**            | Hard                                  |
| **Infinite Ammo** | True                                  |
| **Search Items**  | Health, Powerups, Primary, Secondary. |
| **Faction**       | [Farmer][ffarmer]                     |

**Weapons**

| Gears                | Powerup        |
| :------------------- | :------------- |
| ![Whip] ![GLauncher] | [Suicide Dove] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats          | Value     |
| :------------- | :-------- |
| **Max Energy** | Very High |

</details>

### Hawkeye

<div>
  <img src='./docs/Images/Hawkeye.png' />
</div>

**Stats**

| **Health**        | Above Normal                     |
| :---------------- | :------------------------------- |
| **AI**            | Range Expert                     |
| **Infinite Ammo** | True                             |
| **Search Items**  | Health, Powerups, Streetsweeper. |
| **Faction**       | [Sniper][fsniper]                |

**Weapons**

| Gears              | Powerup       |
| :----------------- | :------------ |
| ![Sniper] ![Lazer] | [Penetration] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                            | Value     |
| :------------------------------- | :-------- |
| **Projectile Crit Chance Dealt** | Very High |
| **Size**                         | Big       |

</details>

### Heavy Soldier

<div>
  <img src='./docs/Images/HeavySoldier.png' />
</div>

**Stats**

| **Health**        | Above Normal        |
| :---------------- | :------------------ |
| **Speed**         | Slow                |
| **AI**            | Soldier             |
| **Infinite Ammo** | True                |
| **Search Items**  | Primary             |
| **Faction**       | [Soldier][fsoldier] |

**Weapons**

| Gears            | Powerup              |
| :--------------- | :------------------- |
| ![M60] ![Pistol] | [Double Penetration] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats    | Value        |
| :------- | :----------- |
| **Size** | Above Normal |

</details>

### Hitman

<div>
  <img src='./docs/Images/Hitman_1.png' />
  <img src='./docs/Images/Hitman_2.png' />
</div>

**Stats**

| **Health**       | Strong                                                                                                                                         |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **Run Speed**    | Below Normal                                                                                                                                   |
| **Sprint Speed** | Fast                                                                                                                                           |
| **AI**           | Expert                                                                                                                                         |
| **Search Items** | All                                                                                                                                            |
| **Faction**      | [Agent][fagent]                                                                                                                                |
| **Abilities**    | <li>Disappears inside portal and shows up behind the enemy.</li><li>Ranged weapons deals x4 damage in the back, x0.5 damage in the front.</li> |

**Weapons**

| Gears             | Powerup     |
| :---------------- | :---------- |
| ![Assault]        | [Precision] |
| ![DarkShotgun]    |             |
| ![SilencedPistol] | [Precision] |

<div>
  <img src='https://media.giphy.com/media/gJTISqTMMW3casX5Kv/giphy.gif' width=500>
</div>

### Huntsman

<div>
  <img src='./docs/Images/Huntsman.png' />
</div>

**Stats**

| **Health**        | Strong                       |
| :---------------- | :--------------------------- |
| **AI**            | Range Expert                 |
| **Infinite Ammo** | True                         |
| **Search Items**  | Makeshift, Health, Powerups. |
| **Faction**       | [Hunter][fhunter]            |

**Weapons**

| Gears                      | Powerup   |
| :------------------------- | :-------- |
| ![Sniper] ![MachinePistol] | [Trigger] |
| ![Magnum]                  | [Trigger] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                            | Value        |
| :------------------------------- | :----------- |
| **Projectile Crit Chance Dealt** | High         |
| **Size**                         | Above Normal |

</details>

### Incinerator

<div>
  <img src='./docs/Images/Incinerator.png' />
</div>

**Stats**

| **Health**        | Extremely Strong                                                                                                                      |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **AI**            | Hard                                                                                                                                  |
| **Infinite Ammo** | True                                                                                                                                  |
| **Search Items**  | Health, Powerups.                                                                                                                     |
| **Faction**       | [Pyromaniac][fpyromaniac]                                                                                                             |
| **Abilities**     | <li>Becomes faster if on fire.</li> <li>Becomes stronger if on max fire.</li> <li>Flamethrower explodes into flames upon dealth.</li> |

**Weapons**

| Gears                             | Powerup   |
| :-------------------------------- | :-------- |
| ![Axe] ![GLauncher] ![molotovwpn] | [Molotov] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                 | Value               |
| :-------------------- | :------------------ |
| **Fire Damage Taken** | Extremely Resistant |

</details>

<div>
  <img src='https://media.giphy.com/media/KMjDoEXXyMDxzfYQNX/giphy.gif' width=500>
</div>

### Ion

<div>
  <img src='./docs/Images/Ion.png' />
</div>

**Stats**

| **Health**        | Strong                           |
| :---------------- | :------------------------------- |
| **Run Speed**     | Very Slow                        |
| **Sprint Speed**  | Slow                             |
| **AI**            | Cowboy                           |
| **Infinite Ammo** | True                             |
| **Search Items**  | Health, Streetsweeper, Powerups. |
| **Faction**       | [Robot][frobot]                  |

**Weapons**

| Gears     | Powerup          |
| :-------- | :--------------- |
| ![Sniper] | [Bouncing Laser] |
| ![Magnum] | [Bouncing Laser] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                            | Value      |
| :------------------------------- | :--------- |
| **Projectile Crit Chance Taken** | Unbeatable |
| **Size**                         | Big        |

</details>

### Kingpin

<div>
  <img src='./docs/Images/Kingpin.png' />
</div>

**Stats**

| **Health**       | Strong                                                                                                        |
| :--------------- | :------------------------------------------------------------------------------------------------------------ |
| **AI**           | Kingpin                                                                                                       |
| **Search Items** | Secondary, Health, Streetsweeper.                                                                             |
| **Faction**      | [Kingpin][fkingpin]                                                                                           |
| **Abilities**    | <li>Grabs and chokes the enemy, dealing continuous damage.</li> <li>Pushes objects away while sprinting.</li> |

**Weapons**

| Gears   | Powerup       |
| :------ | :------------ |
| ![Fist] | [Ground Slam] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value  |
| :--------------------- | :----- |
| **Energy Consumption** | 0.1    |
| **Melee Force**        | Strong |
| **Size**               | Big    |

</details>

<div>
  <img src='https://media.giphy.com/media/etIqMBsz11siHKZ8Sv/giphy.gif' width=500>
</div>

### Kriegbar

<div>
  <img src='./docs/Images/Kriegbar.png' />
</div>

Kriegbar is a primitive and curious creature. After watching countless of other superfighters gunning
and camping successfully. He decided that he likes the idea of killing people from afar. Unfortunately,
his hands are too big to hold the trigger, so he has to improvise a bit by using people as ammunition.

**Stats**

| **Health**    | Ultra Strong                                    |
| :------------ | :---------------------------------------------- |
| **Speed**     | Above Normal                                    |
| **AI**        | Raging Hulk                                     |
| **Weapons**   | ![Slowmo10]                                     |
| **Faction**   | [Scientist][fscientist]                         |
| **Abilities** | Throws players and corpses into nearby enemies. |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                 | Value           |
| :-------------------- | :-------------- |
| **Energy**            | Ultra High      |
| **Fire Damage Taken** | Very Vulnerable |
| **Melee Force**       | Very Strong     |
| **Size**              | Chonky          |

</details>

<div>
  <img src='https://media.giphy.com/media/0eiUwjTEqGGm2olG7Y/giphy.gif' width=500>
</div>

### Lord Pinkerton

<div>
  <img src='./docs/Images/LordPinkerton.png' />
</div>

**Stats**

| **Health**       | Very Strong     |
| :--------------- | :-------------- |
| **AI**           | Hard            |
| **Search Items** | All             |
| **Faction**      | [Biker][fbiker] |

**Weapons**

| Gears                                            | Powerup  |
| :----------------------------------------------- | :------- |
| ![Bazooka] ![SilencedUzi] ![C4] ![StrengthBoost] | [Riding] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                   | Value          |
| :---------------------- | :------------- |
| **Impact Damage Taken** | Very Resistant |
| **Melee Force**         | Above Normal   |
| **Size**                | Big            |

</details>

### Meatgrinder

<div>
  <img src='./docs/Images/Meatgrinder.png' />
</div>

**Stats**

| **Health**        | Extremely Strong |
| :---------------- | :--------------- |
| **Run Speed**     | Above Normal     |
| **Sprint Speed**  | Fast             |
| **AI**            | Meatgrinder      |
| **Infinite Ammo** | True             |
| **Faction**       | None             |

**Weapons**

| Gears                                 | Powerup |
| :------------------------------------ | :------ |
| ![Chainsaw] ![MolotovWpn] ![Slowmo10] |         |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value          |
| :--------------------- | :------------- |
| **Energy**             | Extremely High |
| **Melee Damage Dealt** | Very High      |
| **Melee Force**        | Strong         |
| **Size**               | Big            |

</details>

### Mecha

<div>
  <img src='./docs/Images/Mecha.png' />
</div>

**Stats**

| **Health**          | Extremely Strong                                                                                                                                                                 |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Speed**           | Below Normal                                                                                                                                                                     |
| **AI**              | Hulk                                                                                                                                                                             |
| **Zombie Immunity** | True                                                                                                                                                                             |
| **Faction**         | None                                                                                                                                                                             |
| **Abilities**       | <li>Charges through a group of enemies and tosses them to the sky.</li> <li>Has a chance of exploding on dealth, otherwise launches 3 grenades to create collateral damage.</li> |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value               |
| :-------------------------- | :------------------ |
| **Explosion Damage Taken**  | Extremely Resistant |
| **Projectile Damage Taken** | Very Resistant      |
| **Impact Damage Taken**     | Unbeatable          |
| **Melee Stun Immunity**     | True                |
| **Can Burn**                | False               |
| **Melee Force**             | Ultra Strong        |
| **Size**                    | Extremely Big       |

</details>

<div>
  <img src='https://media.giphy.com/media/x17E4MsrusxB4uhbsJ/giphy.gif' width=500>
</div>

### MetroCop Chief

<div>
  <img src='./docs/Images/MetroCopChief_1.png' />
  <img src='./docs/Images/MetroCopChief_2.png' />
  <img src='./docs/Images/MetroCopChief_3.png' />
</div>

**Stats**

| **Health**        | Strong                           |
| :---------------- | :------------------------------- |
| **Speed**         | Above Normal                     |
| **AI**            | Expert                           |
| **Infinite Ammo** | True                             |
| **Search Items**  | Powerups, Health, Streetsweeper. |
| **Faction**       | [MetroCop][fmetrocop]            |

**Weapons**

| Gears                                 | Powerup     |
| :------------------------------------ | :---------- |
| ![ShockBaton] ![DarkShotgun] ![Lazer] | [Grapeshot] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats           | Value        |
| :-------------- | :----------- |
| **Melee Force** | Above Normal |
| **Size**        | Below Normal |

</details>

### Monk

<div>
  <img src='./docs/Images/Monk.png' />
</div>

**Stats**

| **Health**       | Very Strong                                                                                                                             |
| :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **Speed**        | Fast                                                                                                                                    |
| **AI**           | Melee Hard                                                                                                                              |
| **Weapons**      | ![CueStick]                                                                                                                             |
| **Search Items** | Melee, Makeshift, Health, Powerups.                                                                                                     |
| **Faction**      | None                                                                                                                                    |
| **Abilities**    | <li>Spawns up to 6 clones to hide the real self</li> <li>Clones are just the illusions, they have 10 HP and don't deal any damage.</li> |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value        |
| :--------------------- | :----------- |
| **Melee Damage Dealt** | High         |
| **Size**               | Below Normal |

</details>

<div>
  <img src='https://media.giphy.com/media/rgemMTCoa5vA0GNsJM/giphy.gif' width=500>
</div>

### Nadja

<div>
  <img src='./docs/Images/Nadja.png' />
</div>

**Stats**

| **Health**       | Very Strong                                                                                 |
| :--------------- | :------------------------------------------------------------------------------------------ |
| **Speed**        | Above Normal                                                                                |
| **AI**           | Expert                                                                                      |
| **Search Items** | Secondary, Health.                                                                          |
| **Faction**      | [Soldier][fsoldier]                                                                         |
| **Abilities**    | Places a trap every 9 seconds. Available traps: [Fire Trap], [Shotgun Trap] and [Tripwire]. |

**Weapons**

| Gears                                     | Powerup |
| :---------------------------------------- | :------ |
| ![Knife] ![Pistol] ![Slowmo10] ![MineWpn] |         |

<div>
  <img src='https://media.giphy.com/media/ZaxbUZkpoftjWLO3JS/giphy.gif' width=500>
</div>

### Napoleon

<div>
  <img src='./docs/Images/Napoleon.png' />
</div>

**Stats**

| **Health**        | Very Strong |
| :---------------- | :---------- |
| **Speed**         | Very Fast   |
| **AI**            | Soldier     |
| **Infinite Ammo** | True        |
| **Search Items**  | Primary     |
| **Faction**       | None        |

**Weapons**

| Gears                                               | Powerup               |
| :-------------------------------------------------- | :-------------------- |
| ![GLauncher] ![Uzi] ![Baton] ![Grenade] ![Slowmo10] | [Shrapnel], [Minigun] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value               |
| :-------------------------- | :------------------ |
| **Energy Consumption**      | 0                   |
| **Projectile Damage Taken** | Extremely Resistant |
| **Size**                    | Tiny                |

</details>

### Ninja

<div>
  <img src='./docs/Images/Ninja_1.png' />
  <img src='./docs/Images/Ninja_2.png' />
  <img src='./docs/Images/Ninja_3.png' />
  <img src='./docs/Images/Ninja_4.png' />
</div>

**Stats**

| **Health**        | Very Strong                                                                                                                                                      |
| :---------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Speed**         | Ultra Fast                                                                                                                                                       |
| **AI**            | Ninja                                                                                                                                                            |
| **Infinite Ammo** | True                                                                                                                                                             |
| **Search Items**  | Melee                                                                                                                                                            |
| **Faction**       | None                                                                                                                                                             |
| **Abilities**     | <li>Uses smoke bomb to escape and hide in one of the dynamic objects if its health is below 10%. Can only activate once.</li> <li>Gains 15 HP while hiding.</li> |

**Weapons**

| Gears                 | Powerup |
| :-------------------- | :------ |
| ![Katana] ![Slowmo10] |         |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value       |
| :--------------------- | :---------- |
| **Melee Damage Dealt** | Fairly High |
| **Energy Recharge**    | Quick       |
| **Size**               | Small       |

</details>

<div>
  <img src='https://media.giphy.com/media/ytkSv2mCYcfQPqmtqo/giphy.gif' width=500>
</div>

### Police Chief

<div>
  <img src='./docs/Images/PoliceChief.png' />
</div>

**Stats**

| **Health**        | Very Strong                                        |
| :---------------- | :------------------------------------------------- |
| **AI**            | Hard                                               |
| **Infinite Ammo** | True                                               |
| **Search Items**  | Secondary, Health, Powerups.                       |
| **Faction**       | [Police][fpolice]                                  |
| **Abilities**     | Equips rifles and handguns with [Fatigue] powerup. |

**Weapons**

| Gears                         | Powerup   |
| :---------------------------- | :-------- |
| ![BATON] ![Shotgun] ![Pistol] | [Fatigue] |
| ![ShockBaton] ![Shotgun]      | [Fatigue] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats               | Value |
| :------------------ | :---- |
| **Energy Recharge** | Quick |

</details>

### President

<div>
  <img src='./docs/Images/President.png' />
</div>

The President is not very good at combat due to obesity. As a result, he tends to trip whenever
he attempts to move a little bit too fast. Because of his large volume, he will shake the
ground and create an earthquake on impact, injuring his agents and anyone inside the radius.

**Stats**

| **Health**        | Very Strong                                                                                                                                                                                                                            |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI**            | Hard                                                                                                                                                                                                                                   |
| **Weapons**       | ![Flagpole]                                                                                                                                                                                                                            |
| **Infinite Ammo** | True                                                                                                                                                                                                                                   |
| **Search Items**  | Health, Powerups.                                                                                                                                                                                                                      |
| **Faction**       | [Agent][fagent]                                                                                                                                                                                                                        |
| **Abilities**     | <li>Guarded by all [Agents][agent] in the same team. Agents are very resistant to impact damage thanks to extensive training.</li> <li>Has a chance of tripping and falling while in mid air, creating an [earthquake] on impact.</li> |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                   | Value               |
| :---------------------- | :------------------ |
| **Energy Recharge**     | Slow                |
| **Impact Damage Taken** | Extremely Resistant |
| **Size**                | Chonky              |

</details>

<div>
  <img src='https://media.giphy.com/media/9lfuafejcVBluFvJ88/giphy.gif' width=500>
</div>

### Pyromaniac

<div>
  <img src='./docs/Images/Pyromaniac_1.png' />
  <img src='./docs/Images/Pyromaniac_2.png' />
</div>

**Stats**

| **Health**        | Strong                     |
| :---------------- | :------------------------- |
| **AI**            | Hard                       |
| **Infinite Ammo** | True                       |
| **Faction**       | [Pyromaniac][fpyromaniac]  |
| **Abilities**     | Becomes faster if on fire. |

**Weapons**

| Gears                         | Powerup             |
| :---------------------------- | :------------------ |
| ![Flamethrower] ![MolotovWpn] |                     |
| ![Flaregun] ![MolotovWpn]     | [Infinite Bouncing] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                 | Value          |
| :-------------------- | :------------- |
| **Fire Damage Taken** | Very Resistant |

</details>

### Queen

<div>
  <img src='./docs/Images/Queen_1.png' />
  <img src='./docs/Images/Queen_2.png' />
</div>

**Stats**

| **Health**       | Strong                                                                                                                                         |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **Run Speed**    | Above Normal                                                                                                                                   |
| **Sprint Speed** | Fast                                                                                                                                           |
| **AI**           | Hard                                                                                                                                           |
| **Weapons**      | ![Pillow]                                                                                                                                      |
| **Search Items** | Secondary, Melee, Health.                                                                                                                      |
| **Faction**      | [Stripper][fstripper]                                                                                                                          |
| **Abilities**    | <li>Searches for dead bodies and brings them back to life.</li> <li>Revived players have 50% HP.</li> <li>Revived enemies turn into ally.</li> |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value        |
| :--------------------- | :----------- |
| **Melee Damage Dealt** | Low          |
| **Melee Force**        | Above Normal |
| **Size**               | Below Normal |

</details>

### Quillhogg

<div>
  <img src='./docs/Images/Quillhogg.png' />
</div>

**Stats**

| **Health**        | Very Strong                  |
| :---------------- | :--------------------------- |
| **AI**            | Hard                         |
| **Infinite Ammo** | True                         |
| **Search Items**  | Secondary, Powerups, Health. |
| **Faction**       | [Punk][fpunk]                |

**Weapons**

| Gears                   | Powerup   |
| :---------------------- | :-------- |
| ![GLauncher] ![Grenade] | [Dormant] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats           | Value        |
| :-------------- | :----------- |
| **Melee Force** | Above Normal |
| **Size**        | Big          |

</details>

### Rambo

<div>
  <img src='./docs/Images/Rambo.png' />
</div>

**Stats**

| **Health**        | Strong       |
| :---------------- | :----------- |
| **Speed**         | Below Normal |
| **AI**            | Expert       |
| **Infinite Ammo** | True         |
| **Search Items**  | Health       |
| **Faction**       | None         |

**Weapons**

| Gears           | Powerup   |
| :-------------- | :-------- |
| ![Knife] ![M60] | [Minigun] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                      | Value          |
| :------------------------- | :------------- |
| **Explosion Damage Taken** | Very Resistant |
| **Size**                   | Big            |

</details>

### Raze

<div>
  <img src='./docs/Images/Raze.png' />
</div>

**Stats**

| **Health**        | Very Strong                 |
| :---------------- | :-------------------------- |
| **AI**            | Hard                        |
| **Infinite Ammo** | True                        |
| **Search Items**  | Primary, Secondary, Health. |
| **Faction**       | [Police SWAT][fpoliceswat]  |

**Weapons**

| Gears                                   | Powerup                  |
| :-------------------------------------- | :----------------------- |
| ![Knife] ![GLauncher] ![Pistol45] ![C4] | [Sticky Bomb], [Termite] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                      | Value          |
| :------------------------- | :------------- |
| **Explosion Damage Taken** | Very Resistant |

</details>

### Reznor

<div>
  <img src='./docs/Images/Reznor.png' />
</div>

**Stats**

| **Health**        | Very Strong                |
| :---------------- | :------------------------- |
| **Speed**         | Slow                       |
| **AI**            | Hard                       |
| **Infinite Ammo** | True                       |
| **Search Items**  | Primary, Health, Powerups. |
| **Faction**       | [Spacer][fspacer]          |

**Weapons**

| Gears                             | Powerup     |
| :-------------------------------- | :---------- |
| ![Bazooka] ![Pistol45] ![Lazer]   | [Blackhole] |
| ![GLauncher] ![Pistol45] ![Lazer] | [Blackhole] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats           | Value        |
| :-------------- | :----------- |
| **Melee Force** | Above Normal |
| **Size**        | Big          |

</details>

### Santa

<div>
  <img src='./docs/Images/Santa.png' />
</div>

**Stats**

| **Health**        | Very Strong     |
| :---------------- | :-------------- |
| **AI**            | Hard            |
| **Infinite Ammo** | True            |
| **Faction**       | [Santa][fsanta] |

**Weapons**

| Gears                  | Powerup   |
| :--------------------- | :-------- |
| ![Knife] ![M60] ![Uzi] | [Present] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                      | Value          |
| :------------------------- | :------------- |
| **Explosion Damage Taken** | Very Resistant |
| **Melee Force**            | Strong         |
| **Size**                   | Big            |

</details>

### Sheriff

<div>
  <img src='./docs/Images/Sheriff.png' />
</div>

**Stats**

| **Health**        | Strong                                                                                                                                                                                                    |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI**            | Sheriff                                                                                                                                                                                                   |
| **Weapons**       | ![Magnum] ![Revolver] ![Shotgun]                                                                                                                                                                          |
| **Infinite Ammo** | True                                                                                                                                                                                                      |
| **Search Items**  | Secondary, Health, Powerups.                                                                                                                                                                              |
| **Faction**       | [Cowboy][fcowboy]                                                                                                                                                                                         |
| **Abilities**     | <li>Has unlimited supply of handguns.</li> <li>Has 45% chance of disarming the enemy's weapon after a successful shot.</li><li>Has 35% chance of destroying the enemy's weapon after it is disarmed.</li> |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value            |
| :-------------------------- | :--------------- |
| **Energy**                  | Above Normal     |
| **Projectile Damage Taken** | Fairly Resistant |
| **Item Drop Mode**          | Break            |
| **Size**                    | Above Normal     |

</details>

<div>
  <img src='https://media.giphy.com/media/bGztxOthd4ZxM4SczD/giphy.gif' width=500>
</div>

### Smoker

<div>
  <img src='./docs/Images/Smoker.png' />
</div>

**Stats**

| **Health**        | Very Strong                |
| :---------------- | :------------------------- |
| **AI**            | Hard                       |
| **Infinite Ammo** | True                       |
| **Search Items**  | Primary, Health, Powerups. |
| **Faction**       | [Police SWAT][fpoliceswat] |

**Weapons**

| Gears                                  | Powerup            |
| :------------------------------------- | :----------------- |
| ![Knife] ![GLauncher] ![MachinePistol] | [Smoke], [Fatigue] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value              |
| :-------------------------- | :----------------- |
| **Fire Damage Taken**       | Slightly Resistant |
| **Projectile Damage Dealt** | Below Normal       |

</details>

### Spy

<div>
  <img src='./docs/Images/Spy.png' />
</div>

**Stats**

| **Health**        | Above Normal                                                                                                                         |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| **Speed**         | Above Normal                                                                                                                         |
| **AI**            | Expert                                                                                                                               |
| **Infinite Ammo** | True                                                                                                                                 |
| **Search Items**  | Health, Streetsweeper, Powerups.                                                                                                     |
| **Faction**       | [Assassin][fassassin]                                                                                                                |
| **Abilities**     | <li>Swaps clothes with dead enemies and disguises as their teammates.</li> <li>Deals x5 damage to their team while in disguise.</li> |

**Weapons**

| Gears                | Powerup |
| :------------------- | :------ |
| ![Knife] ![Revolver] |         |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats    | Value        |
| :------- | :----------- |
| **Size** | Above Normal |

</details>

<div>
  <img src='https://media.giphy.com/media/gjf7W2q5aLn3yJUuPB/giphy.gif' width=500>
</div>

### Survivalist

<div>
  <img src='./docs/Images/Survivalist.png' />
</div>

**Stats**

| **Health**        | Strong                    |
| :---------------- | :------------------------ |
| **AI**            | Expert                    |
| **Infinite Ammo** | True                      |
| **Search Items**  | Melee, Makeshift, Health. |
| **Faction**       | None                      |

**Weapons**

| Gears                | Powerup |
| :------------------- | :------ |
| ![Knife] ![Flaregun] | [Steak] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                       | Value     |
| :-------------------------- | :-------- |
| **Projectile Damage Dealt** | Very High |

</details>

### Tank

<div>
  <img src='./docs/Images/Tank.png' />
</div>

**Stats**

| **Health**          | Very Strong                                                                                                     |
| :------------------ | :-------------------------------------------------------------------------------------------------------------- |
| **Run Speed**       | Slow                                                                                                            |
| **Sprint Speed**    | Fast                                                                                                            |
| **AI**              | Hard                                                                                                            |
| **Zombie Immunity** | True                                                                                                            |
| **Search Items**    | Secondary, Health, Streetsweeper, Powerups.                                                                     |
| **Faction**         | [Robot][frobot]                                                                                                 |
| **Abilities**       | <li>Equips ranged weapon with **Stun** powerup.</li> <li>Has armor that can deflect projectiles on impact.</li> |

**Weapons**

| Gears   | Powerup |
| :------ | :------ |
| ![Fist] | [Slide] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                            | Value               |
| :------------------------------- | :------------------ |
| **Energy**                       | Very High           |
| **Projectile Damage Taken**      | Extremely Resistant |
| **Projectile Crit Chance Taken** | Unbeatable          |
| **Size**                         | Extremely Big       |

</details>

<div>
  <img src='https://media.giphy.com/media/v7nHxwsl1RjkkRyPkB/giphy.gif' width=500>
</div>

### Teddy Bear

<div>
  <img src='./docs/Images/Teddybear.png' />
</div>

**Stats**

| **Health**    | Ultra Strong                                                                                                                                                                                  |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Speed**     | Below Normal                                                                                                                                                                                  |
| **AI**        | Hulk                                                                                                                                                                                          |
| **Faction**   | None                                                                                                                                                                                          |
| **Abilities** | <li>Spawned with 2 cubs that follow her around.</li> <li>Enrages and targets the offender every time a cub dies. If there is no offender, she will target the closest one to the corpse.</li> |

**Weapons**

| Gears                  | Powerup |
| :--------------------- | :------ |
| ![Grenade] ![Slowmo10] |         |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                  | Value       |
| :--------------------- | :---------- |
| **Energy**             | Ultra High  |
| **Melee Damage Dealt** | High        |
| **Melee Force**        | Very Strong |
| **Size**               | Chonky      |

</details>

<div>
  <img src='https://media.giphy.com/media/nNEyo4XfdGhH81dIuD/giphy.gif' width=500>
</div>

### Baby Bear

<div>
  <img src='./docs/Images/Teddybear.png' />
</div>

**Stats**

| **Health**    | Very Weak                                              |
| :------------ | :----------------------------------------------------- |
| **Speed**     | Very Fast                                              |
| **AI**        | Babybear                                               |
| **Faction**   | None                                                   |
| **Abilities** | A chronic parasite that can't live without its mother. |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats           | Value |
| :-------------- | :---- |
| **Melee Force** | Weak  |
| **Size**        | Tiny  |

</details>

### Translucent

<div>
  <img src='./docs/Images/Translucent.png' />
</div>

**Stats**

| **Health**       | Very Strong                                                                                                                                    |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI**           | Hard                                                                                                                                           |
| **Search Items** | Health                                                                                                                                         |
| **Faction**      | [Mutant][fmutant]                                                                                                                              |
| **Abilities**    | <li>Is fully invisible. It is exposed briefly when taking damage.</li> <li>Becomes visible for 2 seconds if it accumulates enough damage.</li> |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats    | Value        |
| :------- | :----------- |
| **Size** | Above Normal |

</details>

<div>
  <img src='https://media.giphy.com/media/Hjb0kRrbdMwh4kPKBe/giphy.gif' width=500>
</div>

### Zombie Eater

<div>
  <img src='./docs/Images/ZombieEater_1.png' />
  <img src='./docs/Images/ZombieEater_2.png' />
</div>

These are ancient zombies left from the nazi era. They have survived up until
now after one of the zombies discovered that their fellow zombies are also
a source of nutrition.

**Stats**

| **Health**    | Above Normal                                                                                                                                                        |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Speed**     | Very Fast                                                                                                                                                           |
| **AI**        | Zombie Fighter                                                                                                                                                      |
| **Faction**   | [Zombie Boss][fzombieboss]                                                                                                                                          |
| **Abilities** | <li>Is [Zombie].</li> <li>Eats other zombies and players in sight.</li> <li>Gains 20 HP, becomes bigger and stronger but also slower after consuming the food.</li> |

**Weapons**

| Gears                           | Powerup |
| :------------------------------ | :------ |
| ![Knife] ![Revolver] ![Grenade] |         |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats    | Value |
| :------- | :---- |
| **Size** | Small |

</details>

<div>
  <img src='https://media.giphy.com/media/J2SnmsrD3LLMswR1t5/giphy.gif' width=500>
</div>

### Zombie Fighter

<div>
  <img src='./docs/Images/ZombieFighter_1.png' />
  <img src='./docs/Images/ZombieFighter_2.png' />
  <img src='./docs/Images/ZombieFighter_3.png' />
  <img src='./docs/Images/ZombieFighter_4.png' />
  <img src='./docs/Images/ZombieFighter_5.png' />
  <img src='./docs/Images/ZombieFighter_6.png' />
</div>

**Stats**

| **Health**        | Very Strong                |
| :---------------- | :------------------------- |
| **Speed**         | Above Normal               |
| **AI**            | Zombie Fighter             |
| **Infinite Ammo** | True                       |
| **Faction**       | [Zombie Boss][fzombieboss] |
| **Abilities**     | Same as [Zombie].          |

**Weapons**

| Gears               | Powerup   |
| :------------------ | :-------- |
| ![Fist] ![Slowmo10] | [Serious] |

<details>
  <summary>
    <strong>Other Stats</strong>
  </summary>

| Stats                   | Value        |
| :---------------------- | :----------- |
| **Melee Damage Dealt**  | Above Normal |
| **Melee Stun Immunity** | True         |
| **Size**                | Big          |

</details>

## Script Commands

BotExtended can be played using the default settings without you having to touch the command line. But if you want to customize or try out different bots, weapons or factions, this section is for you.

By default, the game spawns a random faction (See the faction list [here](#list-of-factions)) in team 4 in every match.

All of the commands start with `/botextended` or `/be`. Some commands may require one or more arguments.

### `help`

Usage: `/<botextended|be> help|h|?`

Print all other commands and arguments you can pass to BotExtended.

### `version`

Usage: `/<botextended|be> version|v`

Print the current version of BotExtended.

### `listfaction`

Usage: `/<botextended|be> [listfaction|lf]`

List all of the available `BotFaction`s. A `BotFaction` consists of one or many different bots in a specific theme, for example: Assassin, Police, Zombie... Some `BotFaction`s only have one bot, usually a boss.

A boss is a much stronger bot and often come with special abilities: Mecha boss with bulletproof armor, Demolitionist who can one shot one kill. They are much harder to kill and is equivalent with several expert bots.

`BotFaction`s whose names prefixed with `Boss` will have at least one boss, sometimes spawn with its minions. (Kinpin and bodyguards, BadSanta and his Elks)

```
/be lf
```

#### List of factions

<details>
  <summary>Click to open</summary>

```
0: None
1: Assassin
2: Agent
3: Bandido
4: Biker
5: Clown
6: Cowboy
7: Engineer
8: Farmer
9: Gangster
10: Hunter
11: MetroCop
12: Mutant
13: Nazi
14: Police
15: PoliceSWAT
16: Pyromaniac
17: Robot
18: Scientist
19: Sniper
20: Soldier
21: Spacer
22: SpaceSniper
23: Stripper
24: Survivor
25: Thug
26: Punk
27: Zombie
28: ZombieMutated
200: Boss_Demolitionist
201: Boss_Agent79
202: Boss_Amos
203: Boss_AssKicker
204: Boss_Balista
205: Boss_Balloonatic
206: Boss_BazookaJane
207: Boss_Beast
208: Boss_Berserker
209: Boss_BigMutant
210: Boss_Bobby
211: Boss_Boffin
212: Boss_Chairman
213: Boss_Cindy
214: Boss_Demoman
215: Boss_PoliceChief
216: Boss_Funnyman
217: Boss_Jo
218: Boss_Hacker
219: Boss_Handler
220: Boss_Hawkeye
221: Boss_HeavySoldier
222: Boss_Hitman
223: Boss_Huntsman
224: Boss_Incinerator
225: Boss_Ion
226: Boss_Firebug
227: Boss_Fireman
228: Boss_Kingpin
229: Boss_MadScientist
230: Boss_Kriegbar
231: Boss_Meatgrinder
232: Boss_Mecha
233: Boss_MetroCop
234: Boss_Monk
235: Boss_Nadja
236: Boss_Napoleon
237: Boss_Ninja
238: Boss_President
239: Boss_LordPinkerton
240: Boss_Queen
241: Boss_Quillhogg
242: Boss_Rambo
243: Boss_Raze
244: Boss_Reznor
245: Boss_Santa
246: Boss_Sheriff
247: Boss_Smoker
248: Boss_Spy
249: Boss_Survivalist
250: Boss_Tank
251: Boss_Translucent
252: Boss_Teddybear
253: Boss_ZombieFighter
254: Boss_ZombieEater
```

</details>

### `listbot`

Usage: `/<botextended|be> [listbot|lb]`

List all available `BotType`s.

`BotType` describes a specific bot's appearance, stats and behavior. Each `BotType` has different outfits, starting weapons, modifiers, AI behaviors and special abilities. A `BotFaction` must have multiple `BotType`s in the same theme. For example, Clown `BotFaction` can spawn ClownCowboy, ClownGangster and ClownBoxer `BotType`, but cannot spawn Gangster.

```
/be lb
```

<details>
    <summary>Result</summary>

```
0: None
1: AssassinMelee
2: AssassinRange
3: Agent
4: Bandido
5: Biker
6: BikerHulk
7: Bodyguard
8: Bodyguard2
9: Cyborg
10: ClownBodyguard
11: ClownBoxer
12: ClownCowboy
13: ClownGangster
14: Cowboy
15: Elf
16: Engineer
17: Farmer
18: Gangster
19: GangsterHulk
20: Gardener
21: Hunter
22: Lumberjack
23: MetroCop
24: Mutant
25: NaziLabAssistant
26: NaziHulk
27: NaziScientist
28: NaziSoldier
29: Police
30: PoliceSWAT
31: LabAssistant
32: Scientist
33: Survivor
34: Sniper
35: Soldier
36: Spacer
37: SpaceSniper
38: Stripper
39: SuicideDwarf
40: Thug
41: ThugHulk
42: Punk
43: PunkHulk
44: Zombie
45: ZombieAgent
46: ZombieBruiser
47: ZombieChild
48: ZombieFat
49: ZombieFlamer
50: ZombieGangster
51: ZombieNinja
52: ZombiePolice
53: ZombiePrussian
54: ZombieSoldier
55: ZombieThug
56: ZombieWorker
57: Agent79
58: Amos
59: AssKicker
60: Balista
61: Balloonatic
62: BazookaJane
63: Beast
64: Berserker
65: BigMutant
66: Bobby
67: Boffin
68: Chairman
69: Cindy
70: Demolitionist
71: Demoman
72: Firebug
73: Fireman
74: Fritzliebe
75: Funnyman
76: Jo
77: Hacker
78: Handler
79: Hawkeye
80: HeavySoldier
81: Hitman
82: Huntsman
83: Incinerator
84: Ion
85: Kingpin
86: Kriegbar
87: LordPinkerton
88: Meatgrinder
89: Mecha
90: MetroCop2
91: Monk
92: Nadja
93: Napoleon
94: Ninja
95: PoliceChief
96: President
97: Pyromaniac
98: Queen
99: Quillhogg
100: Rambo
101: Raze
102: Reznor
103: Santa
104: Sheriff
105: Smoker
106: Spy
107: SSOfficer
108: Survivalist
109: Tank
110: Teddybear
111: Babybear
112: Translucent
113: ZombieEater
114: ZombieFighter
```

</details>

### `listrangedpowerup`

Usage: `/<botextended|be> [listrangedpowerup|lrp]`

List all ranged powerups. See [`setweapon`](#setweapon) command for further detail.

```
/be lrp
```

<details>
    <summary>Result</summary>

```
0: None
1: Blackhole
2: Blast
3: BouncingLaser
4: Bow
5: Delay
6: Dormant
7: DoublePenetration
8: DoubleTrouble
9: Fatigue
10: Fire
11: Helium
12: Hunting
13: Homing
14: Gauss
15: Grapeshot
16: Gravity
17: GravityDE
18: InfiniteBouncing
19: Knockback
20: Minigun
21: Molotov
22: Lightning
23: Mine
24: Object
25: Penetration
26: Poison
27: PreciseBouncing
28: Precision
29: Present
30: Riding
31: Scattershot
32: Shrapnel
33: Shrinking
34: Smoke
35: Stun
36: Spinner
37: Steak
38: StickyBomb
39: SuicideDove
40: SuicideFighter
41: Taco
42: Taser
43: Tearing
44: Termite
45: Trigger
46: Welding
```

</details>

### `listmeleepowerup`

Usage: `/<botextended|be> [listmeleepowerup|lmp]`

List all melee powerups. See [`setweapon`](#setweapon) command for further detail.

```
/be lrp
```

<details>
    <summary>Result</summary>

```
0: None
1: Breaking
2: Earthquake
3: FireTrail
4: Hurling
5: Gib
6: GroundBreaker
7: GroundSlam
8: Megaton
9: Pushback
10: Serious
11: Slide
12: Splitting
```

</details>

### `findfaction`

Usage: `/<botextended|be> [findfaction|ff] <query>`

Find all bot factions that match query

```
/be ff zombie
```

```
--BotExtended find results--
14: Zombie
15: ZombieHard
213: Boss_Zombie
```

### `settings`

Usage: `/<botextended|be> [settings|s]`

Display current script settings

```
/be s
```

### `create`

Usage: `/<botextended|be> [create|c] <BotType> [1|2|3|4|_] [Count]`

Spawn one or a group of bots. First argument is `BotType`. See [`listbot`](#listbot) to list all `BotType`s. This is the only required argument.

The second argument is the team to spawn from `t1` to `t4`, `t0` is independent. Default to independent.

Third argument is the number of bot to spawn. Default to 1.

_Example_:

Spawn one funnyman

```
/be c funnyman
```

Spawn 5 metrocops at Team 2

```
/be c 34 t2 5
```

Spawn 3 bandidos at team independent

```
/be c bandido t0 3
```

Spawn 1 cowboy at team 2

```
/be c cowboy t2
```

Spawn 2 cowboy at team independent

```
/be c bandido 2
```

### `botcount`

Usage: `/<botextended|be> [botcount|bc] <1-30>`

Set the total bot count in all bot teams combine. Be aware the actual number of bots is capped based on this formula:

<pre>
<code>RealBotCount = Min(SpawnerCount - Players, <strong>BotCount</strong>)</code>
</pre>

If you spawn the bots in 3 teams:

```
/be f t1 all
/be f t2 all
/be f t3 all
```

And the `RealBotCount` value is 5 then the bot counts from team 1 to 3 are `2`, `2`, `1` respectively.

The number of bots therefore depends on the map size (bigger maps have more spawners), the number of players from the lobby and the number of bot teams.

```
/be bc 2
```

### `faction`

Usage: `/<botextended|be> [Team] [faction|f] [-e] <names|indexes|all>`

Select a list of `BotFaction`s by either name or index to randomly spawn on startup. Each faction is separated by a space. `all` argument means randomizing all `BotFaction`s. Add -e flag before the argument list to exclude those `BotFaction`s instead. Select `none` to disable spawning bot to that team. Team arguments ranges from `t1` to `t4`

```bash
/be f sniper thug boss_jo boss_hacker
```

You can use the index instead of `BotFaction` name to shorten the command. See [`listfaction`](#listfaction) for more detail.

```
/be f 11 13 202 203
```

Select all factions.

```
/be f all
```

Select all except zombie factions.

```
/be f -e Zombie ZombieHard Boss_Zombie
```

Don't spawn bots on team 3.

```
/be f t3 none
```

To select one `BotFaction` to spawn every round, simply select that `BotFaction` only and set [`factionrotation`](#factionrotation) to `0` to disable rotation.

```bash
/be fr 0
/be f biker
```

### `factionrotation`

Usage: `/<botextended|be> [factionrotation|fr] <0-10>`

Set faction rotation interval for every n rounds. Set `0` to disable rotation

```
/be fr 4
```

### `nextfaction`

Usage: `/<botextended|be> [nextfaction|nf]`

Change the faction in the current faction rotation to the next faction

```
/be nf
```

### `setplayer`

Usage: `/<botextended|be> [setplayer|sp] <player> <BotType>`

Set player outfit, weapons and modifiers to the same as `BotType`. Player argument can be either name or slot index. Type `/listplayers`
to see the list of players and their respective indexes. this settings will be saved permanently. To reset, replace `BotType` value with `None`.
Use [`clearplsettings`](#clearplsettings) to reset settings for all players.

Set player 0 to funnyman

```
/be sp 0 funnyman
```

Reset player Spud to normal

```
/be sp spud none
```

### `setweapon`

Usage: `/<botextended|be> [setweapon|sw] <player> <WeaponItem> <Powerup>`

Give specific player a powerup weapon.

Give player 'your_name' an electroshock magnum.

```
/be setweapon your_name magnum stun
```

Give player 'near' hurl powerup. None weapon means barehand.

```
/be setweapon near none hurl
```

Same command as above but use indexes to shorten the command.

```
/be sw 0 1 1
```

Remove powerup. Magnum now fires normal rounds.

```
/be sw near magnum none
```

Remove all powerup weapons that in the player's inventory (not apply until the next round).

```
/be sw near none
```

### `clearplsettings`

Usage: `/<botextended|be> [clearplsettings|cp]`

Clear all player settings.

## Development

- Clone [ScriptLinker](https://github.com/nearhuscarl/scriptlinker) project on my github.
- Build in DEBUG mode. The global hotkeys doesn't work in RELEASE mode for some reasons but I'm too lazy to fix it now.
- Open ScriptLinker > Script > New, then enter the _Name_, _Entry Point_ and _Project Directory_. Remind me to add a way to read the script metedata in the future.

![New Script](./docs/NewScript.png)

- Open [this](./src) solution in _Visual Studio_.
- In BotExtended project, Click Reference > Add Reference > Browse > Select `...\Steam\steamapps\common\Superfighters Deluxe\SFD.GameScriptInterface.dll`
- Start coding and press `F8` to save change.

<!-- demos -->

[special abilities]: https://www.youtube.com/watch?v=BuafVqIVGp0&list=PLNgAmHQnqv_mDr3G3yN4ahVNeBA-578UD
[custom weapons]: https://www.youtube.com/watch?v=8id_mqD-9EI&list=PLNgAmHQnqv_neDehA2uAENMws0WBDx18k

<!-- bot type -->

[agent]: #agent
[biker]: #biker
[bodyguard]: #bodyguard
[gangster]: #gangster
[gangster hulk]: #gangster-hulk
[kingpin]: #kingpin
[bobby]: #bobby
[jo]: #jo
[thug]: #Thug
[zombie]: #Zombie

<!-- Factions -->

[fassassin]: ./docs/FACTIONS.md#assassin
[fagent]: ./docs/FACTIONS.md#agent
[fbandido]: ./docs/FACTIONS.md#bandido
[fbiker]: ./docs/FACTIONS.md#biker
[fcowboy]: ./docs/FACTIONS.md#cowboy
[fclown]: ./docs/FACTIONS.md#clown
[fengineer]: ./docs/FACTIONS.md#engineer
[ffarmer]: ./docs/FACTIONS.md#farmer
[fgangster]: ./docs/FACTIONS.md#gangster
[fhunter]: ./docs/FACTIONS.md#hunter
[fkingpin]: ./docs/FACTIONS.md#kingpin
[fmetrocop]: ./docs/FACTIONS.md#metrocop
[fmutant]: ./docs/FACTIONS.md#mutant
[fnazi]: ./docs/FACTIONS.md#nazi
[fpolice]: ./docs/FACTIONS.md#Police
[fpoliceswat]: ./docs/FACTIONS.md#police-swat
[fpunk]: ./docs/FACTIONS.md#punk
[fpyromaniac]: ./docs/FACTIONS.md#pyromaniac
[fscientist]: ./docs/FACTIONS.md#scientist
[fsniper]: ./docs/FACTIONS.md#Sniper
[fsoldier]: ./docs/FACTIONS.md#soldier
[fspacer]: ./docs/FACTIONS.md#spacer
[fspacesniper]: ./docs/FACTIONS.md#space-sniper
[fstripper]: ./docs/FACTIONS.md#stripper
[fsurvivor]: ./docs/FACTIONS.md#survivor
[fthug]: ./docs/FACTIONS.md#thug
[fzombie]: ./docs/FACTIONS.md#zombie
[fzombiemutated]: ./docs/FACTIONS.md#zombie-mutated
[fkingpin]: ./docs/FACTIONS.md#kingpin
[frobot]: ./docs/FACTIONS.md#robot
[fsanta]: ./docs/FACTIONS.md#santa
[fzombieboss]: ./docs/FACTIONS.md#zombie-boss

<!-- Melee Powerups -->

[breaking]: ./docs/POWERUPS_MELEE.md#breaking
[earthquake]: ./docs/POWERUPS_MELEE.md#earthquake
[fire trail]: ./docs/POWERUPS_MELEE.md#fire-trail
[hurling]: ./docs/POWERUPS_MELEE.md#hurling
[gib]: ./docs/POWERUPS_MELEE.md#gib
[ground slam]: ./docs/POWERUPS_MELEE.md#ground-slam
[megaton]: ./docs/POWERUPS_MELEE.md#megaton
[pushback]: ./docs/POWERUPS_MELEE.md#pushback
[serious]: ./docs/POWERUPS_MELEE.md#serious
[slide]: ./docs/POWERUPS_MELEE.md#slide
[splitting]: ./docs/POWERUPS_MELEE.md#splitting

<!-- Ranged Powerups -->

[blackhole]: ./docs/POWERUPS_RANGED.md#blackhole
[blast]: ./docs/POWERUPS_RANGED.md#blast
[bow]: ./docs/POWERUPS_RANGED.md#bow
[bouncing laser]: ./docs/POWERUPS_RANGED.md#bouncing-laser
[dormant]: ./docs/POWERUPS_RANGED.md#dormant
[double penetration]: ./docs/POWERUPS_RANGED.md#double-penetration
[infinite bouncing]: ./docs/POWERUPS_RANGED.md#infinite-bouncing
[fatigue]: ./docs/POWERUPS_RANGED.md#fatigue
[fire]: ./docs/POWERUPS_RANGED.md#fire
[helium]: ./docs/POWERUPS_RANGED.md#helium
[homing]: ./docs/POWERUPS_RANGED.md#homing
[gauss]: ./docs/POWERUPS_RANGED.md#gauss-gun
[grapeshot]: ./docs/POWERUPS_RANGED.md#grapeshot
[knockback]: ./docs/POWERUPS_RANGED.md#knockback
[lightning]: ./docs/POWERUPS_RANGED.md#lightning
[mine]: ./docs/POWERUPS_RANGED.md#mine
[minigun]: ./docs/POWERUPS_RANGED.md#minigun
[molotov]: ./docs/POWERUPS_RANGED.md#molotov
[object]: ./docs/POWERUPS_RANGED.md#object-gun
[penetration]: ./docs/POWERUPS_RANGED.md#penetration
[poison]: ./docs/POWERUPS_RANGED.md#poison
[precise bouncing]: ./docs/POWERUPS_RANGED.md#precise-bouncing
[precision]: ./docs/POWERUPS_RANGED.md#precision
[present]: ./docs/POWERUPS_RANGED.md#present
[riding]: ./docs/POWERUPS_RANGED.md#riding
[scattershot]: ./docs/POWERUPS_RANGED.md#scattershot
[shrapnel]: ./docs/POWERUPS_RANGED.md#shrapnel
[shrinking]: ./docs/POWERUPS_RANGED.md#shrinking
[smoke]: ./docs/POWERUPS_RANGED.md#smoke
[spinner]: ./docs/POWERUPS_RANGED.md#spinner
[steak]: ./docs/POWERUPS_RANGED.md#steak
[sticky bomb]: ./docs/POWERUPS_RANGED.md#sticky-bomb
[stun]: ./docs/POWERUPS_RANGED.md#stun
[suicide dove]: ./docs/POWERUPS_RANGED.md#suicide-dove
[suicide fighter]: ./docs/POWERUPS_RANGED.md#suicide-fighter
[taser]: ./docs/POWERUPS_RANGED.md#taser-gun
[tearing]: ./docs/POWERUPS_RANGED.md#tearing
[termite]: ./docs/POWERUPS_RANGED.md#termite
[trigger]: ./docs/POWERUPS_RANGED.md#trigger

<!-- custom weapons -->

[camp]: ./docs/CUSTOM_WEAPONS.md#camp
[chicken]: ./docs/CUSTOM_WEAPONS.md#chicken
[fire trap]: ./docs/CUSTOM_WEAPONS.md#fire-trap
[lasersweeper]: ./docs/CUSTOM_WEAPONS.md#lasersweeper
[shotgun trap]: ./docs/CUSTOM_WEAPONS.md#shotgun-trap
[tripwire]: ./docs/CUSTOM_WEAPONS.md#tripwire
[turret]: ./docs/CUSTOM_WEAPONS.md#turret

<!-- weapons -->

[assault]: ./docs/Images/Weapons/Assault.png
[axe]: ./docs/Images/Weapons/Axe.png
[bat]: ./docs/Images/Weapons/Bat.png
[baseball]: ./docs/Images/Weapons/Baseball.png
[baton]: ./docs/Images/Weapons/Baton.png
[bazooka]: ./docs/Images/Weapons/Bazooka.png
[bottle]: ./docs/Images/Weapons/Bottle.png
[bowwpn]: ./docs/Images/Weapons/Bow.png
[c4]: ./docs/Images/Weapons/C4.png
[carbine]: ./docs/Images/Weapons/Carbine.png
[chain]: ./docs/Images/Weapons/Chain.png
[chainsaw]: ./docs/Images/Weapons/Chainsaw.png
[chair]: ./docs/Images/Weapons/Chair.png
[cuestick]: ./docs/Images/Weapons/CueStick.png
[darkshotgun]: ./docs/Images/Weapons/DarkShotgun.png
[flagpole]: ./docs/Images/Weapons/Flagpole.png
[flamethrower]: ./docs/Images/Weapons/Flamethrower.png
[flaregun]: ./docs/Images/Weapons/FlareGun.png
[fist]: ./docs/Images/Weapons/Fist.png
[glauncher]: ./docs/Images/Weapons/GLauncher.png
[grenade]: ./docs/Images/Weapons/Grenade.png
[hammer]: ./docs/Images/Weapons/Hammer.png
[katana]: ./docs/Images/Weapons/Katana.png
[knife]: ./docs/Images/Weapons/Knife.png
[lazer]: ./docs/Images/Weapons/Lazer.png
[leadpipe]: ./docs/Images/Weapons/LeadPipe.png
[m60]: ./docs/Images/Weapons/M60.png
[machete]: ./docs/Images/Weapons/Machete.png
[machinepistol]: ./docs/Images/Weapons/MachinePistol.png
[magnum]: ./docs/Images/Weapons/Magnum.png
[minewpn]: ./docs/Images/Weapons/Mine.png
[molotovwpn]: ./docs/Images/Weapons/Molotov.png
[mp50]: ./docs/Images/Weapons/MP50.png
[pillow]: ./docs/Images/Weapons/Pillow.png
[pipe]: ./docs/Images/Weapons/Pipe.png
[pistol]: ./docs/Images/Weapons/Pistol.png
[pistol45]: ./docs/Images/Weapons/Pistol45.png
[revolver]: ./docs/Images/Weapons/Revolver.png
[sawedoff]: ./docs/Images/Weapons/SawedOff.png
[shockbaton]: ./docs/Images/Weapons/ShockBaton.png
[shotgun]: ./docs/Images/Weapons/Shotgun.png
[silencedpistol]: ./docs/Images/Weapons/SilencedPistol.png
[silenceduzi]: ./docs/Images/Weapons/SilencedUzi.png
[slowmo10]: ./docs/Images/Weapons/SloMo10.png
[smg]: ./docs/Images/Weapons/SMG.png
[sniper]: ./docs/Images/Weapons/Sniper.png
[strengthboost]: ./docs/Images/Weapons/StrengthBoost.png
[teapot]: ./docs/Images/Weapons/Teapot.png
[tommygun]: ./docs/Images/Weapons/TommyGun.png
[uzi]: ./docs/Images/Weapons/Uzi.png
[whip]: ./docs/Images/Weapons/Whip.png
