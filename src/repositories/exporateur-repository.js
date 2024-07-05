import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import argon2d from 'argon2';
import jwt from 'jsonwebtoken';
import Explorateur from '../models/explorateur-model.js';
import Booster from '../constants/boosters.js';



class ExplorateurRepository {


  retrieveOne(idExplorateur) {
    return Explorateur.findById(idExplorateur); //SELECT * FROM planets WHERE idPlanet = [idPlanet]
  }

  retrieveOneByEmail(email) {
    return Explorateur.findOne({ email: email }); //SELECT * FROM planets WHERE idPlanet = [idPlanet]
  }

  async updateExplorateur(token, destination, inox, elements) {

    let user = await this.retrieveOneByEmail(token.email);
    let explorateur = {};
    if (inox) {

      inox += user.inox;
      explorateur = await Explorateur.findByIdAndUpdate(user._id, { inox: inox }, { new: true })


    }
    if (elements.length > 0) {
      let newElement = [];

      elements.forEach(element => {


        newElement.push({ element: element.element, quantity: element.quantity })

      })
      if (user.elements.length > 0) {
        user.elements.forEach(element => {
          let change = false
          newElement.forEach(newElement => {
            if (element.element === newElement.element) {
              newElement.quantity += element.quantity
              change = true
            }
          })
          if (!change) {
            newElement.push({ element: element.element, quantity: element.quantity })
          }
        })
      }


      explorateur = await Explorateur.findByIdAndUpdate(user._id, { elements: newElement }, { new: true })
    }


    explorateur = await Explorateur.findByIdAndUpdate(user._id, { location: destination }, { new: true })


    return explorateur
  }


  async login(email, username, password) {

    const explorateur = await Explorateur.findOne({ $or: [{ email: email }, { username: username }] });
    if (!explorateur) {
      return { err: HttpError.Unauthorized() }
    }
    //Nous avons un compte avec le email ou username
    //Vérification du bon mot de passe
    if (await this.validatePassword(password, explorateur)) {
      return { explorateur };
    } else {
      // Mauvais mot de passe
      return { err: HttpError.Unauthorized() }
    }

  }



  async create(explorateur) {
    try {
      explorateur.uuid = uuidv4();
      explorateur.passwordHash = await argon2d.hash(explorateur.password);
      delete explorateur.password;
      return Explorateur.create(explorateur); // INSERT () INTO planets VALUES()
    } catch (err) {
      throw err;
    }

  }




  generateJWT(email) {
    const accessToken = jwt.sign(
      { email },
      process.env.JWT_PRIVATE_SECRET,
      { expiresIn: process.env.JWT_LIFE, issuer: process.env.BASE_URL });

    const refreshToken = jwt.sign(
      { email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_LIFE, issuer: process.env.BASE_URL });

    return { accessToken, refreshToken };
  }

  async validatePassword(password, account) {
    try {
      return await argon2d.verify(account.passwordHash, password);
    } catch (err) {
      throw err;
    }
  }

  async addInox() {
    let explorateurs = await Explorateur.find();
    explorateurs.forEach(explorateur => {
      explorateur.inox += 2

      explorateur.save()
    })
  }

  async setElementZero(email) {
    let explorateur = await this.retrieveOneByEmail(email);
    let elements = Object.values(Booster.Elements)
    let newElement = [];
    elements.forEach(element => {
      let quantity = 0

      newElement.push({ element: element, quantity: quantity })
    })
    explorateur = await Explorateur.findByIdAndUpdate(explorateur._id, { elements: newElement }, { new: true })
    return explorateur
  }

  async addElement() {
    let explorateurs = await Explorateur.find();
    let elements = Object.values(Booster.Elements)

    explorateurs.forEach(async explorateur => {
      let newElement = [];
      elements.forEach(element => {
        let quantity = Math.floor(Math.random() * 3) + 1

        newElement.push({ element: element, quantity: quantity })
      })
      if (explorateur.elements.length > 0) {
        explorateur.elements.forEach(element => {
          let change = false
          newElement.forEach(newElement => {
            if (element.element === newElement.element) {
              newElement.quantity += element.quantity
              change = true
            }
          })
          if (!change) {
            newElement.push({ element: element.element, quantity: element.quantity })
          }
        })
      }
      //console.log(explorateur.elements)
      //console.log(newElement)
      await Explorateur.findByIdAndUpdate(explorateur._id, { elements: newElement })
      //explorateur.element = newElement
      //explorateur.save()

    })





  }

  async openBooster(explorateur, idBooster) {
    let newElement = explorateur.elements
    let loot = {}
    let currentBooster = {}
    let newBooster = []
    explorateur.boosters.forEach(booster => {

      if (booster._id == idBooster) {
        if (explorateur.inox >= booster.price) {
          currentBooster = booster

          explorateur.inox -= booster.price

          let rarity = Booster.MaxDrop[booster.rarity]
          let dropValueInox = Math.floor(Math.random() * rarity) + 1
          let elements = []
          for (let i = 0; i < 5; i++) {

            let dropValue = Math.floor(Math.random() * rarity) + 1
            let dropElement = Math.floor(Math.random() * Object.keys(Booster.Elements).length) + 1
            let toAddElement = Booster.Elements[dropElement]


            let change = false
            if (elements.length > 0) {
              elements.forEach(element => {
                if (element.element == toAddElement) {
                  change = true
                  element.quantity += dropValue
                }
              })
            }
            if (!change) {
              elements.push({ element: toAddElement, quantity: dropValue })
            }
          }

          /////////////////////////////////////////

          newElement = JSON.parse(JSON.stringify(elements));


          if (explorateur.elements.length > 0) {
            explorateur.elements.forEach(element => {
              let change = false
              newElement.forEach(newElement => {
                if (element.element === newElement.element) {
                  newElement.quantity += element.quantity
                  change = true
                }
              })
              if (!change) {
                newElement.push({ element: element.element, quantity: element.quantity })
              }
            })
          }




          loot = { inox: dropValueInox, elements: elements }

        } else {
          return { error: "Vous n'avez pas assez d'argent" }
        }
      }

      return { error: "Impossible d'ouvrir ce booster" }

    })
    explorateur.boosters.forEach(booster => {
      if (booster._id != currentBooster._id) {
        newBooster.push(booster)
      }
    })
    explorateur.boosters = newBooster
    explorateur.save()
    explorateur = await Explorateur.findByIdAndUpdate(explorateur._id, { elements: newElement }, { new: true })

    return { loot, explorateur }

  }

  async generateBooster() {
    let explorateurs = await Explorateur.find();
    explorateurs.forEach(explorateur => {
      explorateur.boosters = [];
      for (let i = 0; i < 3; i++) {
        let dropRate = Math.floor(Math.random() * 100) + 1
        //console.log(dropRate)
        if (dropRate >= 100) {
          console.log("Myth")
          explorateur.boosters.push({
            rarity: Booster.Rarity.Mythical,
            price: Booster.Price.Mythical
          })
        }
        else if (dropRate >= 98) {
          console.log("Legendary")
          explorateur.boosters.push({
            rarity: Booster.Rarity.Legendary,
            price: Booster.Price.Legendary

          })
        }
        else if (dropRate >= 85) {
          console.log("Epic")
          explorateur.boosters.push({
            rarity: Booster.Rarity.Epic,
            price: Booster.Price.Epic
          })
        }
        else if (dropRate >= 70) {
          console.log("Rare")
          explorateur.boosters.push({
            rarity: Booster.Rarity.Rare,
            price: Booster.Price.Rare
          })
        }
        else if (dropRate >= 50) {
          console.log("Rare")
          explorateur.boosters.push({
            rarity: Booster.Rarity.Rare,
            price: Booster.Price.Rare
          })
        }
        else if (dropRate >= 25) {
          console.log("UnCommon")
          explorateur.boosters.push({
            rarity: Booster.Rarity.Uncommon,
            price: Booster.Price.Uncommon
          })
        } else {
          console.log("Common")
          explorateur.boosters.push({
            rarity: Booster.Rarity.Common,
            price: Booster.Price.Common
          })
        }


      }
      //console.log(explorateur.booster)
      explorateur.save();
    });
  }

  transform(explorateur) {
    explorateur.href = `${process.env.BASE_URL}/explorateurs/${explorateur._id}`;
    if (explorateur.boosters) {
      explorateur.boosters.forEach(booster => {
        booster.openMe = `${process.env.BASE_URL}/explorateurs/boosters/${booster._id}`;
        delete booster._id
      })
    }

    delete explorateur._id;
    delete explorateur.__v;
    delete explorateur.password; //supprime le mot de passe en clair de l'objet avant de le sauvegarder
    delete explorateur.passwordHash;
    return explorateur;

  }


}



export default new ExplorateurRepository();
