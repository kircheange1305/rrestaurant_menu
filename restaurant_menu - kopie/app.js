require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
const pool = new Pool();
const port = 3000;

app.set('view engine', 'ejs');app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax' }
}));

function requireAdmin(req, res, next) {
    if (!req.session.adminId) {
        return res.redirect('/admin/login');
    }

    next();
}

app.get('/', (req, res) => {
    res.redirect('/categories');
});

app.get('/categories', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT id, name FROM categories ORDER BY id'
        );

        res.render('categories', { categories: result.rows });
    } catch (error) {
        next(error);
    }
});

app.get('/categories/:id', async (req, res, next) => {
    const id = Number(req.params.id);

    if (!/^\d+$/.test(req.params.id) || id < 1 || id > 2147483647) {
        return res.status(404).send('Kategorie nenalezena.');
    }

    try {
        const categoryResult = await pool.query(
            'SELECT id, name FROM categories WHERE id = $1',
            [id]
        );
        const category = categoryResult.rows[0];

        if (!category) {
            return res.status(404).send('Kategorie nenalezena.');
        }

        const dishesResult = await pool.query(
            'SELECT name, description, price FROM menu_items WHERE category_id = $1 ORDER BY id',
            [id]
        );

        res.render('category', { category, dishes: dishesResult.rows });
    } catch (error) {
        next(error);
    }
});

app.get('/admin/login', (req, res) => {
    res.render('admin-login');
});

app.post('/admin/login', async (req, res, next) => {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).send('Zadejte e-mail a heslo.');
    }

    try {
        const result = await pool.query(
            'SELECT id, password_hash FROM admins WHERE email = $1',
            [email.trim()]
        );
        const admin = result.rows[0];

        if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
            return res.status(401).send('Nesprávný e-mail nebo heslo.');
        }

        req.session.regenerate((error) => {
            if (error) return next(error);

            req.session.adminId = admin.id;

            req.session.save((error) => {
                if (error) return next(error);

                res.redirect('/admin');
            });
        });
    } catch (error) {
        next(error);
    }
});

app.get('/admin', requireAdmin, async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT id, name, price FROM menu_items ORDER BY id'
        );

        res.render('admin-dishes', { dishes: result.rows });
    } catch (error) {
        next(error);
    }
});

app.get('/admin/dishes/new', requireAdmin, async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT id, name FROM categories ORDER BY id'
        );

        res.render('admin-new-dish', { categories: result.rows });
    } catch (error) {
        next(error);
    }
});

app.post('/admin/dishes', requireAdmin, async (req, res, next) => {
    const body = req.body ?? {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string'
        ? body.description.trim()
        : '';
    const price = body.price;
    const categoryId = body.category_id === '' ? null : Number(body.category_id);

    if (!name || name.length > 150) {
        return res.status(400).send('Zadejte název jídla (max. 150 znaků).');
    }

    if (typeof price !== 'string' || !/^\d{1,6}(\.\d{1,2})?$/.test(price)) {
        return res.status(400).send('Zadejte platnou cenu s nejvýše dvěma desetinnými místy.');
    }

    if (categoryId !== null && (
        typeof body.category_id !== 'string' ||
        !/^\d+$/.test(body.category_id) ||
        categoryId < 1 ||
        categoryId > 2147483647
    )) {
        return res.status(400).send('Vyberte platnou kategorii.');
    }

    try {
        await pool.query(
            `INSERT INTO menu_items (name, description, price, category_id)
             VALUES ($1, $2, $3, $4)`,
            [name, description || null, price, categoryId]
        );

        res.redirect(303, '/admin');
    } catch (error) {
        if (error.code === '23503') {
            return res.status(400).send('Vybraná kategorie už neexistuje.');
        }

        next(error);
    }
});

app.get('/admin/dishes/:id/edit', requireAdmin, async (req, res, next) => {
    const rawId = req.params.id;
    const id = Number(rawId);
    const hasOnlyDigits = /^\d+$/.test(rawId);
    const isInRange = id >= 1 && id <= 2147483647;

    if (!hasOnlyDigits || !isInRange) {
        return res.status(404).send('Jídlo nenalezeno.');
    }

    try {
        const dishResult = await pool.query(
            'SELECT id, name, description, price, category_id FROM menu_items WHERE id = $1',
            [id]
        );
        const dish = dishResult.rows[0];

        if (!dish) {
            return res.status(404).send('Jídlo nenalezeno.');
        }

        const categoryResult = await pool.query(
            'SELECT id, name FROM categories ORDER BY id'
        );

        res.render('admin-edit-dish', {
            dish,
            categories: categoryResult.rows
        });
    } catch (error) {
        next(error);
    }
});

app.post('/admin/dishes/:id/edit', requireAdmin, async (req, res, next) => {
    const rawId = req.params.id;
    const id = Number(rawId);

    if (!/^\d+$/.test(rawId) || id < 1 || id > 2147483647) {
        return res.status(404).send('Jídlo nenalezeno.');
    }

    const body = req.body ?? {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const description = typeof body.description === 'string'
        ? body.description.trim()
        : '';
    const price = body.price;
    const categoryId = body.category_id === '' ? null : Number(body.category_id);

    if (!name || name.length > 150) {
        return res.status(400).send('Zadejte název jídla (max. 150 znaků).');
    }

    if (typeof price !== 'string' || !/^\d{1,6}(\.\d{1,2})?$/.test(price)) {
        return res.status(400).send('Zadejte platnou cenu s nejvýše dvěma desetinnými místy.');
    }

    if (categoryId !== null && (
        typeof body.category_id !== 'string' ||
        !/^\d+$/.test(body.category_id) ||
        categoryId < 1 ||
        categoryId > 2147483647
    )) {
        return res.status(400).send('Vyberte platnou kategorii.');
    }

    try {
        const result = await pool.query(
            `UPDATE menu_items
             SET name = $1, description = $2, price = $3, category_id = $4
             WHERE id = $5`,
            [name, description || null, price, categoryId, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Jídlo nenalezeno.');
        }

        res.redirect(303, '/admin');
    } catch (error) {
        if (error.code === '23503') {
            return res.status(400).send('Vybraná kategorie už neexistuje.');
        }

        next(error);
    }
});

app.post('/admin/dishes/:id/delete', requireAdmin, async (req, res, next) => {
    const rawId = req.params.id;
    const id = Number(rawId);

    if (!/^\d+$/.test(rawId) || id < 1 || id > 2147483647) {
        return res.status(404).send('Jídlo nenalezeno.');
    }

    try {
        const result = await pool.query(
            'DELETE FROM menu_items WHERE id = $1',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Jídlo nenalezeno.');
        }

        res.redirect(303, '/admin');
    } catch (error) {
        next(error);
    }
});

app.post('/admin/logout', requireAdmin, (req, res, next) => {
    req.session.destroy((error) => {
        if (error) return next(error);

        res.clearCookie('connect.sid');
        res.redirect(303, '/admin/login');
    });
});


app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    console.error(error);
    res.status(500).send('Něco se pokazilo. Zkuste to prosím znovu.');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});