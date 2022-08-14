//пара координат (xy), пара точек (ab)
var PAIR = {
    //создание точек и областей
    CREATE: {
        //ТОЧКА по 2 координатам
        f_xy: function (x, y) {
            'use strict';
            return ({
                x: x,
                y: y
            });
        },

        //ТОЧКА по 2 одинаковым координатам
        f_xy_same: function (x_and_y) {
            'use strict';
            return PAIR.CREATE.f_xy(x_and_y, x_and_y);
        },
        
        //переводит массив массивов длины 2 в массив точек
        f_xy_array: function (arr_arr_01) {
            'use strict';
            var //длина массива точек = длине данного массива
                len = arr_arr_01.length,
                //итоговый массив точек (изначально пуст)
                arr_of_points = [],
                i;
            //смотри точка за точкой
            for (i = 0; i < len; i += 1) {
                //проталкивай текущую точку в конец массива
                arr_of_points.push(
                    PAIR.CREATE.f_xy(
                        arr_arr_01[i][0], //в начале х - координта
                        arr_arr_01[i][1]  //далее у - координата
                    )
                );
            }
            
            return arr_of_points;
        },

        //ОБЛАСТЬ по 4 координатам
        f_ab_4: function (x1, y1, x2, y2) {
            'use strict';
            return ({
                a: PAIR.CREATE.f_xy(x1, y1),
                b: PAIR.CREATE.f_xy(x2, y2)
            });
        },

        //ОБЛАСТЬ размера 1 по ЛЕВОМУ ВЕРХНЕМУ углу
        f_ab_mono: function (x1, y1) {
            'use strict';
            return PAIR.CREATE.f_ab_4(x1, y1, x1 + 1, y1 + 1);
        },

        //ОБЛАСТЬ по 2 точкам
        f_ab_2: function (a, b) {
            'use strict';
            return {
                a: a,
                b: b
            };
        },

        //ОБЛАСТЬ от начала координат
        f_ab_00: function (a) {
            'use strict';
            return PAIR.CREATE.f_ab_4(0, 0, a.x, a.y);
        },

        //ОБЛАСТЬ по углу и размерам
        f_ab_wh_2: function (a, wh) {
            'use strict';
            var //другой угол: к текущему прибавь размеры области
                b = PAIR.CREATE.f_xy(a.x + wh.x, a.y + wh.y);
            return PAIR.Create_ab_2(a, b);
        }
    },

    //сложение, умножение, размер области, центр области
    MATH: {
        //складывает координаты двух точек
        f_add: function (p1, p2) {
            'use strict';
            return PAIR.CREATE.f_xy(p1.x + p2.x, p1.y + p2.y);
        },
        
        //сжать во стролько раз по 2 осям (разделить одно на другое)
        f_compress: function (p, scale_xy) {
            'use strict';
            return PAIR.CREATE.f_xy(
                p.x / scale_xy.x,
                p.y / scale_xy.y
            );
        },
        
        //умножает координаты двух точек
        f_point_mult: function (p1, p2) {
            'use strict';
            return PAIR.CREATE.f_xy(p1.x * p2.x, p1.y * p2.y);
        },
        
        //растяжение по 2 осям (optional: в одинаковое число раз) 
        f_same_mult: function (p, scale_xy_same) {
            'use strict';
            return PAIR.CREATE.f_xy(
                p.x * scale_xy_same,
                p.y * scale_xy_same
            );
        },

        //возвращает центр области
        f_center_of_area: function (ab) {
            'use strict';
            return PAIR.CREATE.f_xy((ab.b.x + ab.a.x) / 2, (ab.b.y + ab.a.y) / 2);
        },

        //получает разность двух точек (размеры области)
        f_dxy: function (ab) {
            'use strict';
            return PAIR.CREATE.f_xy(ab.b.x - ab.a.x, ab.b.y - ab.a.y);
        },

        //минимальный из размеров области (разности координат обеих точек)
        f_dxy_min: function (ab) {
            'use strict';
            return Math.min(ab.b.x - ab.a.x, ab.b.y - ab.a.y);
        },

        //максимальный из размеров области (разности координат обеих точек)
        f_dxy_max: function (ab) {
            'use strict';
            return Math.max(ab.b.x - ab.a.x, ab.b.y - ab.a.y);
        },

        //является ли область вертикальной? (ширина меньше высоты)
        f_is_vert: function (ab) {
            'use strict';
            var sizes = PAIR.MATH.f_dxy(ab);
            return (sizes.x < sizes.y);
        }
    },

    //обрезанная область (со всех 4 сторон)
    CUT: {
        //обрезает область на соответствующее число
        f_URDL: function (ab, U, R, D, L) {
            'use strict';
            return PAIR.CREATE.f_ab_4(
                ab.a.x + L,
                ab.a.y + U,
                ab.b.x - R,
                ab.b.y - D
            );
        },

        //обрезает w: слева и справа, h: сверху и снизу
        f_wh: function (ab, w, h) {
            'use strict';
            return PAIR.CUT.f_URDL(ab, h, w, h, w);
        },

        //обрезает с каждой стороны зоны одно и тоже число пискелей
        f_same: function (ab, cut) {
            'use strict';
            return PAIR.CUT.f_URDL(ab, cut, cut, cut, cut);
        },

        //обрезает до квадрата
        f_cut_making_square: function (ab) {
            'use strict';
            var side_max = PAIR.MATH.f_dxy_max(ab),
                side_min = PAIR.MATH.f_dxy_min(ab),

                //на сколько надо срезать с 2 сторон по длинной оси
                cut = (side_max - side_min) / 2,
                d_01 = [[0, cut], [cut, 0]],
                //вертикальный (0) или горизонтальный (1) срез
                d = d_01[PAIR.MATH.f_is_vert(ab) ? 0 : 1];

            return PAIR.f_cut_wh(ab, d[0], d[1]);
        },
        
        //срезает, оставляя после среза такую часть исходных размеров 
        f_cut_part_wh: function (ab, part_of_total_xy) {
            'use strict';
            var dxy = PAIR.MATH.f_dxy(ab),
                w = (1 - part_of_total_xy.x) / 2,
                h = (1 - part_of_total_xy.y) / 2;
            return PAIR.CUT.f_wh(ab, dxy.x * w, dxy.y * h);
        }
    },

    //принадлежность точки интервалу и области
    BELONG: {
        //принадлежит ли точка интервалу [min..max]
        f_xy: function (n, min_border, max_border) {
            'use strict';
            return ((min_border <= n) && (n <= max_border));
        },

        //принадлежит ли точка области (включая границы)
        f_ab: function (ab, x, y) {
            'use strict';
            return (
                PAIR.BELONG.f_xy(x, ab.a.x, ab.b.x) &&
                PAIR.BELONG.f_xy(y, ab.a.y, ab.b.y)
            );
        }
    },

    //получаем область по сетке из внешней области
    GRID: {
        //area_pixels - область пикселей; область на прямоугольном поле
        f_area: function (area_pixels, area_grid, size_grid) {
            'use strict';
            var //ширина и высота всей сетки
                wh_total = PAIR.MATH.f_dxy(area_pixels),
                //ширина и высота искомой ячейки
                wh = PAIR.MATH.f_compress(wh_total, size_grid);

            //итоговая область
            return PAIR.CREATE.f_ab_4(
                area_pixels.a.x + wh.x * area_grid.a.x,
                area_pixels.a.y + wh.y * area_grid.a.y,
                area_pixels.a.x + wh.x * area_grid.b.x,
                area_pixels.a.y + wh.y * area_grid.b.y
            );
        },

        //area_pixels - область пикселей, одна клетка на квадратном поле
        f_cell: function (board_pixels, coord_x, coord_y, cells_in_square) {
            'use strict';
            var //область одной ячейки на сетке
                monomino = PAIR.CREATE.f_ab_mono(coord_x, coord_y),
                //две стороны квадрата: одинаковые размеры сетки
                square_grid = PAIR.CREATE.f_xy_same(cells_in_square);

            return PAIR.GRID.f_area(board_pixels, monomino, square_grid);
        },

        //дана область с "nAll" строками, верни область 1 строки
        f_row_in_column: function (area, nAll, nNow) {
            'use strict';
            var cell_now = PAIR.CREATE.f_ab_4(0, nNow, 1, nNow + 1),
                sizes = PAIR.CREATE.f_xy(1, nAll);
            return (PAIR.GRID.f_area(area, cell_now, sizes));
        }
    }
};
